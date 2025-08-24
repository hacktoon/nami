import { EvenPointSampling } from '/src/lib/geometry/point/sampling'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/geometry/point'
import { Rect } from '/src/lib/geometry/rect'
import { Random } from '/src/lib/random'
import { Grid } from '/src/lib/grid'


const SURFACE_NOISE_RATIO = .6
const REGION_WATER = false
const REGION_LAND = true

const EMPTY = null
const REGION_SCALE = 3  // distance between region origins
const REGION_GROWTH = [2, 1]
const REGION_CHANCE = .1


export class LandMaskZone {
    #landMaskGrid

    constructor(context) {
        this.size = context.zoneSize
        this.#landMaskGrid = buildModel(context)
    }

    isLand(zonePoint) {
        return this.#landMaskGrid.get(zonePoint)
    }

    draw(props, params) {
        const {canvas, canvasPoint, tilePoint, tileSize, world} = props
        const zoneSize = this.size
        const size = tileSize / zoneSize
        // render zone tiles
        // const isBorder = world.surface.isBorder(tilePoint)
        for (let x=0; x < zoneSize; x++) {
            const xSize = x * size
            for (let y=0; y < zoneSize; y++) {
                const zonePoint = [y, x]
                const ySize = y * size
                const zoneCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                let color = this.isLand(zonePoint) ? '#71b13e' : '#2f367d'
                // let color = this.isLand(zonePoint)
                //     ? isBorder ? '#57892d' : '#71b13e'
                //     : isBorder ? '#1d2255' : '#2f367d'
                canvas.rect(zoneCanvasPoint, size, color)
            }
        }
    }
}


function buildModel(context) {
    // Generate a boolean grid (land or water)
    const {worldPoint, world, rect, zoneRect} = context
    const relativePoint = Point.multiplyScalar(worldPoint, zoneRect.width)
    const noiseRect = Rect.multiply(rect, zoneRect.width)
    const isLand = world.surface.isLand(worldPoint)
    const {regionGrid, borderRegions} = buildZoneRegionModel(context)
    const landMaskGrid = Grid.fromRect(zoneRect, zonePoint => {
        const regionId = regionGrid.get(zonePoint)
        const noisePoint = Point.plus(relativePoint, zonePoint)
        if (borderRegions.has(regionId)) {
            const noise = world.noise.get4DZoneOutline(noiseRect, noisePoint)
            return noise > SURFACE_NOISE_RATIO ? REGION_LAND : REGION_WATER
        } else {
            return isLand ? REGION_LAND : REGION_WATER
        }
    })
    return landMaskGrid
}


function buildZoneRegionModel(context) {
    const {zoneRect} = context
    // create a grid with many regions fragmenting the zone map
    const regionGrid = Grid.fromRect(zoneRect, () => EMPTY)
    const origins = EvenPointSampling.create(zoneRect, REGION_SCALE)
    // region id map to direction in zone rect
    const borderRegions = new Set()
    // prepare fill map with fill id => fill origin
    // it's also a map of all regions
    const fillMap = new Map(origins.map((origin, id) => [id, {origin}]))
    const fillContext = {...context, regionGrid, borderRegions}
    new RegionFloodFill(fillMap, fillContext).complete()
    return {regionGrid, borderRegions}
}


class RegionFloodFill extends ConcurrentFill {
    getGrowth() { return Random.choiceFrom(REGION_GROWTH) }
    getChance() { return REGION_CHANCE }

    getNeighbors(fill, parentPoint) {
        const rect = fill.context.zoneRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in zone rect - flood fill from borders to center
        return points.filter(p => rect.isInside(p))
    }

    isEmpty(fill, fillPoint) {
        return fill.context.regionGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, fillPoint) {
        const {zoneRect, regionGrid, borderRegions} = fill.context
        if (zoneRect.isEdge(fillPoint)) {
            borderRegions.add(fill.id)
        }
        regionGrid.set(fillPoint, fill.id)
    }
}