import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'
import { Rect } from '/src/lib/number'
import { Matrix } from '/src/lib/matrix'

import {
    Surface,
    ContinentSurface,
    IslandSurface,
    OceanSurface,
    SeaSurface,
} from './data'

// chunk
// 0,0   1,0   2,0
// 0,1   1,1   2,1
// 0,2   1,2   2,2


const CHUNK_POINT_SIDE_MAP = {
    0: {
        0: [Direction.WEST, Direction.NORTH, Direction.NORTHWEST],
        1: [Direction.WEST],
        2: [Direction.WEST, Direction.SOUTH, Direction.NORTHWEST],
    },
    1: {
        0: [Direction.NORTH],
        1: [],
        2: [Direction.SOUTH]
    },
    2: {
        0: [Direction.EAST, Direction.NORTH, Direction.NORTHEAST],
        1: [Direction.EAST],
        2: [Direction.EAST, Direction.SOUTH, Direction.NORTHEAST],
    },
}


export class SurfaceChunk {
    #layers
    #matrix
    #chunkRect

    constructor({world, chunkSize, worldPoint}) {
        this.worldPoint = worldPoint
        this.size = chunkSize
        this.#layers = world.layers
        this.#chunkRect = Rect.multiply(world.rect, this.size)
        this.#matrix = this.#build(chunkSize, worldPoint)
    }

    #build(chunkSize, worldPoint) {
        const surfaceLayer = this.#layers.surface
        const isChunkLand = surfaceLayer.isLand(worldPoint)
        const isBorderChunk = surfaceLayer.isBorder(worldPoint)
        const surface = surfaceLayer.get(worldPoint)
        // scale world coordinate to chunk 3x3 grid
        const baseChunkPoint = Point.multiplyScalar(worldPoint, chunkSize)
        const buildTile = (indexPoint) => {
            const isCellLand = this.#isCellLand(baseChunkPoint, indexPoint)
            const [x, y] = indexPoint
            if (! isBorderChunk) return surface
            // middle point remains the same
            if (x == 1 && y == 1) return surface
            // handle borders world points
            const directions = CHUNK_POINT_SIDE_MAP[x][y]
            // side points
            if (x == 1 || y == 1) {
                const sideChunk = Point.plus(worldPoint, directions[0].axis)
                const isSideChunkSea = surfaceLayer.isSea(sideChunk)
                const isSideChunkLand = surfaceLayer.isLand(sideChunk)
                const bothLand = isChunkLand && isSideChunkLand
                const bothWater = !isChunkLand && !isSideChunkLand
                // mark sea cells on land chunks neighbor to sea chunks
                if (! isCellLand && isChunkLand && isSideChunkSea) {
                    return SeaSurface
                }
                if (bothLand || bothWater)
                    return surface
            } else {  // corners points
                let totalSeaSides = 0
                let totalLandSides = 0
                for (let direction of directions) {
                    const sideChunk = Point.plus(worldPoint, direction.axis)
                    totalLandSides += surfaceLayer.isLand(sideChunk) ? 1 : 0
                    totalSeaSides += surfaceLayer.isSea(sideChunk) ? 1 : 0
                }
                if (totalLandSides > 2) {
                    return ContinentSurface
                }
                // mark sea cells on land chunks neighbor to sea chunks
                if (! isCellLand && totalSeaSides > 0) {
                    return SeaSurface
                }
            }
            if (isCellLand) {
                if (surfaceLayer.isIsland(worldPoint)) return IslandSurface
                return ContinentSurface
            }
            if (surfaceLayer.isSea(worldPoint)) return SeaSurface
            return OceanSurface
        }

        return Matrix.fromSize(chunkSize, indexPoint => {
            const surface = buildTile(indexPoint)
            return surface.id
        })
    }

    #isCellLand(baseChunkPoint, indexPoint) {
        // handle the other chunk points
        const surfaceLayer = this.#layers.surface
        const chunkPoint = Point.plus(baseChunkPoint, indexPoint)
        const noise = this.#layers.noise.get4D(this.#chunkRect, chunkPoint, 'outline')
        // any of neighbors are island? if land, set island
        // any of neighbors are sea? is water, set sea
        return noise > .6
    }

    get(point) {
        const surfaceId = this.#matrix.get(point)
        return Surface.parse(surfaceId)
    }
}