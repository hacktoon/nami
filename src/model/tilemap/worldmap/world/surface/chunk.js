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


export class SurfaceChunk {
    #grid

    constructor(context) {
        this.size = context.chunkSize
        this.#grid = buildModel(context)
    }

    isLand(chunkPoint) {
        return this.#grid.get(chunkPoint)
    }

    draw(props, params) {
        const {canvas, canvasPoint, tilePoint, tileSize, world} = props
        const chunkSize = this.size
        const size = tileSize / chunkSize
        // render chunk tiles
        // const isBorder = world.surface.isBorder(tilePoint)
        for (let x=0; x < chunkSize; x++) {
            const xSize = x * size
            for (let y=0; y < chunkSize; y++) {
                const chunkPoint = [y, x]
                const ySize = y * size
                const chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                let color = this.isLand(chunkPoint) ? '#71b13e' : '#2f367d'
                // let color = this.isLand(chunkPoint)
                //     ? isBorder ? '#57892d' : '#71b13e'
                //     : isBorder ? '#1d2255' : '#2f367d'
                canvas.rect(chunkCanvasPoint, size, color)
            }
        }
    }
}


function buildModel(context) {
    // Generate a boolean grid (land or water)
    const {worldPoint, world, rect, chunkRect} = context
    const relativePoint = Point.multiplyScalar(worldPoint, chunkRect.width)
    const noiseRect = Rect.multiply(rect, chunkRect.width)
    const isLand = world.surface.isLand(worldPoint)
    const {regionGrid, borderRegions} = buildChunkRegionModel(context)
    const grid = Grid.fromRect(chunkRect, chunkPoint => {
        const regionId = regionGrid.get(chunkPoint)
        const noisePoint = Point.plus(relativePoint, chunkPoint)
        if (borderRegions.has(regionId)) {
            const noise = world.noise.get4DChunkOutline(noiseRect, noisePoint)
            return noise > SURFACE_NOISE_RATIO ? REGION_LAND : REGION_WATER
        } else {
            return isLand ? REGION_LAND : REGION_WATER
        }
    })
    return grid
}


function buildChunkRegionModel(context) {
    const {chunkRect} = context
    // create a grid with many regions fragmenting the chunk map
    const regionGrid = Grid.fromRect(chunkRect, () => EMPTY)
    const origins = EvenPointSampling.create(chunkRect, REGION_SCALE)
    // region id map to direction in chunk rect
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
        const rect = fill.context.chunkRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in chunk rect - flood fill from borders to center
        return points.filter(p => rect.isInside(p))
    }

    isEmpty(fill, fillPoint) {
        return fill.context.regionGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, fillPoint) {
        const {chunkRect, regionGrid, borderRegions} = fill.context
        if (chunkRect.isEdge(fillPoint)) {
            borderRegions.add(fill.id)
        }
        regionGrid.set(fillPoint, fill.id)
    }
}