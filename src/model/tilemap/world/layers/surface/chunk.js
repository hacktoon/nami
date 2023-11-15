import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'
import { Rect } from '/src/lib/number'
import { Matrix } from '/src/lib/matrix'

import { Surface } from './data'


// 0,0   1,0   2,0
// 0,1   1,1   2,1
// 0,2   1,2   2,2

const CHUNK_SIDE_DIRECTION_MAP = {
    0: {1: Direction.WEST},
    1: {0: Direction.NORTH, 2: Direction.SOUTH},
    2: {1: Direction.EAST},
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
        const isLandBlock = surfaceLayer.isLand(worldPoint)
        const isBorderBlock = surfaceLayer.isBorder(worldPoint)
        // scale coordinate to block grid
        const surface = surfaceLayer.get(worldPoint)
        const baseChunkPoint = Point.multiplyScalar(worldPoint, chunkSize)
        const buildTile = (indexPoint) => {
            // handle borders world points
            if (isBorderBlock) {
                const [x, y] = indexPoint
                // middle point remains the same
                if (x == 1 && y == 1) return surface
                // side points
                if (x == 1 || y == 1) {
                    const direction = CHUNK_SIDE_DIRECTION_MAP[x][y]
                    const sidePoint = Point.plus(worldPoint, direction.axis)
                    const isSidePointLand = surfaceLayer.isLand(sidePoint)
                    const isLandNeighbor = isLandBlock && isSidePointLand
                    const isWaterNeighbor = !isLandBlock && !isSidePointLand
                    if (isLandNeighbor || isWaterNeighbor) {
                        return surface
                    }
                }
                // corners points
            } else {
                // remove water tiles inside continent
                return surface
            }

            // handle the other chunk points
            const chunkPoint = Point.plus(baseChunkPoint, indexPoint)
            const noise = noiseLayer.get4D(this.#chunkRect, chunkPoint, 'outline')
            // any of neighbors are island? if land, set island
            // any of neighbors are sea? is water, set sea
            if (noise > .6) {
                if (surfaceLayer.isIsland(worldPoint)) return Surface.ISLAND
                return Surface.CONTINENT
            }
            if (surfaceLayer.isSea(worldPoint)) return Surface.SEA
            return Surface.OCEAN
        }

        return Matrix.fromSize(chunkSize, indexPoint => {
            const surface = buildTile(indexPoint)
            return surface.id
        })
    }

    get(point) {
        const surfaceId = this.#matrix.get(point)
        return Surface.get(surfaceId)
    }
}