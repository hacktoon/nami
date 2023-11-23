import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'
import { Rect } from '/src/lib/number'
import { Matrix } from '/src/lib/matrix'
// import { Random } from '/src/lib/random'

import {
    Surface,
    ContinentSurface,
    OceanSurface,
} from './data'

import {
    buildCornerCell,
    buildSideCell
} from './cell'



// chunk
// 0,0   1,0   2,0
// 0,1   1,1   2,1
// 0,2   1,2   2,2


const CELL_SIDE_DIRECTION_MAP = {
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
        const isBorderChunk = surfaceLayer.isBorder(worldPoint)
        const surface = surfaceLayer.get(worldPoint)
        // scale world coordinate to chunk 3x3 grid
        const baseChunkPoint = Point.multiplyScalar(worldPoint, chunkSize)
        const isChunkWater = surfaceLayer.isWater(worldPoint)
        const bodyMatrix = this.#buildBodyMatrix(chunkSize, worldPoint)
        const buildTile = (indexPoint) => {
            const [x, y] = indexPoint
            if (! isBorderChunk) return surface
            if (x == 1 && y == 1) return surface
            // middle point remains the same
            const context = {
                isCellLand: ! bodyMatrix.get(indexPoint).water,
                directions: CELL_SIDE_DIRECTION_MAP[x][y],
                isChunkWater,
                surface,
                surfaceLayer,
                worldPoint
            }
            if (x == 1 || y == 1) {
                return buildSideCell(context)
            } else {
                return buildCornerCell(context)
            }
        }
        return Matrix.fromSize(chunkSize, indexPoint => {
            const surface = buildTile(indexPoint)
            return surface.id
        })
    }

    #buildBodyMatrix(chunkSize, worldPoint) {
        const baseChunkPoint = Point.multiplyScalar(worldPoint, chunkSize)
        const noiseLayer = this.#layers.noise
        return Matrix.fromSize(chunkSize, indexPoint => {
            const chunkPoint = Point.plus(baseChunkPoint, indexPoint)
            const noise = noiseLayer.get4D(this.#chunkRect, chunkPoint, 'outline')
            return (noise > .6) ? ContinentSurface : OceanSurface
        })
    }

    get(point) {
        const surfaceId = this.#matrix.get(point)
        return Surface.parse(surfaceId)
    }
}