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
        const noiseLayer = this.#layers.noise
        const surfaceLayer = this.#layers.surface
        const isLandChunk = surfaceLayer.isLand(worldPoint)
        const isBorderChunk = surfaceLayer.isBorder(worldPoint)
        // scale coordinate to block grid
        const surface = surfaceLayer.get(worldPoint)
        const baseChunkPoint = Point.multiplyScalar(worldPoint, chunkSize)
        const buildTile = (indexPoint) => {
            // handle borders world points
            if (isBorderChunk) {
                const [x, y] = indexPoint
                // middle point remains the same
                if (x == 1 && y == 1) return surface
                // side and corner points
                const directions = CHUNK_POINT_SIDE_MAP[x][y]
                for (let direction of directions) {
                    const sidePoint = Point.plus(worldPoint, direction.axis)
                    if (x == 1 || y == 1) {
                        const isSidePointLand = surfaceLayer.isLand(sidePoint)
                        const isLandNeighbor = isLandChunk && isSidePointLand
                        const isWaterNeighbor = !isLandChunk && !isSidePointLand
                        if (isLandNeighbor || isWaterNeighbor) {
                            return surface
                        }
                    } else {  // corners
                        // if (! isLandChunk && surfaceLayer.isSea(sidePoint)) {
                        //     return SeaSurface
                        // }
                    }

                }

                // corners points
            } else {
                // remove water tiles inside continent
                return surface
            }
            return this.#getSurfaceByNoise(baseChunkPoint, worldPoint, indexPoint)
        }

        return Matrix.fromSize(chunkSize, indexPoint => {
            const surface = buildTile(indexPoint)
            return surface.id
        })
    }

    #getSurfaceByNoise(baseChunkPoint, worldPoint, indexPoint) {
        // handle the other chunk points
        const surfaceLayer = this.#layers.surface
        const chunkPoint = Point.plus(baseChunkPoint, indexPoint)
        const noise = this.#layers.noise.get4D(this.#chunkRect, chunkPoint, 'outline')
        // any of neighbors are island? if land, set island
        // any of neighbors are sea? is water, set sea
        if (noise > .6) {
            if (surfaceLayer.isIsland(worldPoint)) return IslandSurface
            return ContinentSurface
        }
        if (surfaceLayer.isSea(worldPoint)) return SeaSurface
        return OceanSurface
    }

    get(point) {
        const surfaceId = this.#matrix.get(point)
        return Surface.parse(surfaceId)
    }
}