import { EvenPointSampling } from '/src/lib/geometry/point/sampling'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/geometry/point'
import { Rect } from '/src/lib/geometry/rect'
import { Grid } from '/src/lib/grid'

import {
    ContinentSurface,
    OceanSurface,
} from './type'


const EMPTY = null

const SURFACE_NOISE_RATIO = .6
const REGION_WATER = false
const REGION_LAND = true
const REGION_SCALE = 2  // distance between region origins
const REGION_GROWTH = 1
const REGION_CHANCE = .1



export class SurfaceChunk {
    #grid

    constructor(context) {
        this.size = context.chunkSize
        this.#grid = buildGrid(context)
    }

    isLand(chunkPoint) {
        return this.#grid.get(chunkPoint)
    }

    draw(props, params) {
        const { canvas, canvasPoint, tileSize } = props
        const chunkSize = this.size
        const size = tileSize / chunkSize
        for (let x = 0; x < chunkSize; x++) {
            const xSize = x * size
            for (let y = 0; y < chunkSize; y++) {
                const chunkPoint = [y, x]
                const ySize = y * size
                const chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                let color = this.isLand(chunkPoint)
                    ? ContinentSurface.color
                    : OceanSurface.color
                canvas.rect(chunkCanvasPoint, size, color.toHex())
            }
        }
    }
}


function buildGrid(context) {
    // Generate a boolean grid (land or water)
    const { worldPoint, world, rect, chunkRect } = context
    const relativePoint = Point.multiplyScalar(worldPoint, chunkRect.width)
    const noiseRect = Rect.multiply(rect, chunkRect.width)
    const { regionGrid, borderRegions } = buildRegionModel(context)
    const isWorldLand = world.surface.isLand(worldPoint)
    return Grid.fromRect(chunkRect, chunkPoint => {
        const noisePoint = Point.plus(relativePoint, chunkPoint)
        const noise = world.noise.get4DChunkOutline(noiseRect, noisePoint)
        const regionId = regionGrid.get(chunkPoint)
        // set central regions as the same as world point surface
        if (!borderRegions.has(regionId))
            return isWorldLand
        return noise > SURFACE_NOISE_RATIO ? REGION_LAND : REGION_WATER
    })
}


function buildRegionModel(context) {
    // Generate a boolean grid (land or water)
    const { chunkRect } = context
    // Each chunk point is a region ID
    const regionGrid = Grid.fromRect(chunkRect, () => EMPTY)
    const origins = EvenPointSampling.create(chunkRect, REGION_SCALE)
    const borderRegions = new Set()
    // prepare fill map with fill id => fill origin
    // it's also a map of all regions
    const fillMap = new Map(origins.map((origin, id) => [id, { origin }]))
    const fillContext = { ...context, regionGrid, borderRegions }
    // fill grid
    new RegionFloodFill(chunkRect, fillMap, fillContext).complete()
    return { regionGrid, borderRegions }
}


class RegionFloodFill extends ConcurrentFill {
    getGrowth() { return REGION_GROWTH }
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
        const { chunkRect, regionGrid, borderRegions } = fill.context
        if (chunkRect.isEdge(fillPoint)) {
            borderRegions.add(fill.id)
        }
        regionGrid.set(fillPoint, fill.id)
    }
}