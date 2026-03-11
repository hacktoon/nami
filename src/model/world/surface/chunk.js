import { EvenPointSampling } from '/src/lib/geometry/point/sampling'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/geometry/point'
import { Random } from '/src/lib/random'
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
    #model

    constructor(context) {
        this.size = context.chunkSize
        this.#model = buildModel(context)
    }

    get(chunkPoint) {
        const model = this.#model
        const region = model.regionGrid.get(chunkPoint)
        return {
            region,
            isLand: model.surfaceGrid.get(chunkPoint),
            anchor: model.anchorMap.get(region),
            type: model.typeMap.get(region),
        }
    }

    isLand(chunkPoint) {
        return this.#model.surfaceGrid.get(chunkPoint)
    }

    draw(props, params) {
        const { canvas, canvasPoint, tileSize } = props
        const chunkSize = this.size
        const size = tileSize / chunkSize
        for (let x = 0; x < chunkSize; x++) {
            const xSize = x * size
            for (let y = 0; y < chunkSize; y++) {
                const chunkPoint = [y, x]
                // const chunk = this.get(chunkPoint)
                const ySize = y * size
                const chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                let color = this.isLand(chunkPoint)
                    ? ContinentSurface.color
                    : OceanSurface.color
                // if (chunk.isLand && chunk.anchor && Point.equals(chunk.anchor, chunkPoint)) {
                //     canvas.rect(chunkCanvasPoint, size, '#840')
                // }
                canvas.rect(chunkCanvasPoint, size, color.toHex())
            }
        }
    }
}


function buildModel(context) {
    // Generate a boolean grid (land or water)
    const { worldPoint, world, rect, chunkRect } = context
    const regionModel = buildRegionModel(context)
    const relativePoint = Point.multiplyScalar(worldPoint, chunkRect.width)
    const noiseRect = Rect.multiply(rect, chunkRect.width)
    const isWorldLand = world.surface.isLand(worldPoint)
    const isWorldIsland = world.surface.isIsland(worldPoint)
    const surfaceGrid = Grid.fromRect(chunkRect, chunkPoint => {
        const noisePoint = Point.plus(relativePoint, chunkPoint)
        const noise = world.noise.get4DChunkOutline(noiseRect, noisePoint)
        const regionId = regionModel.regionGrid.get(chunkPoint)
        // override noise on central regions
        if (!regionModel.borderRegions.has(regionId)) {
            if (isWorldIsland)  // islands use less land
                return regionId % 2 == 0 ? REGION_LAND : REGION_WATER
            // as the same as world point surface
            return isWorldLand
        }
        // chunk border regions are set by noise
        return noise > SURFACE_NOISE_RATIO ? REGION_LAND : REGION_WATER
    })
    return { ...regionModel, surfaceGrid }
}


function buildRegionModel(context) {
    // Generate a boolean grid (land or water)
    const { chunkRect } = context
    const typeMap = new Map()
    const anchorMap = new Map()
    const borderRegions = new Set()
    // prepare fill map with fill id => fill origin
    // it's also a map of all regions
    const origins = EvenPointSampling.create(chunkRect, REGION_SCALE)
    const fillMap = new Map(origins.map((origin, id) => {
        // get origins except for edge points as anchors for tracing paths
        const offset = 2
        const [x, y] = origin
        const insideX = x >= offset && x < chunkRect.width - offset
        const insideY = y >= offset && y < chunkRect.height - offset
        if (insideX && insideY) {
            // pick any region 2 tiles inside
            const regionType = id % 2 == 0 || id % 5 == 0
            typeMap.set(id, regionType)
            anchorMap.set(id, origin)
        }
        return [id, { origin }]
    }))
    // Each chunk point has a region ID
    const regionGrid = Grid.fromRect(chunkRect, () => EMPTY)
    const fillContext = { ...context, regionGrid, borderRegions }
    new RegionFloodFill(chunkRect, fillMap, fillContext).complete()
    return { regionGrid, borderRegions, anchorMap, typeMap }
}


class RegionFloodFill extends ConcurrentFill {
    getGrowth() { return REGION_GROWTH }
    getChance() { return REGION_CHANCE }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
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