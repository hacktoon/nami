import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'
import { Rect } from '/src/lib/number'
import { Matrix } from '/src/lib/matrix'


const GRID_DIR_MASK = [
    [
        [Direction.NORTH, Direction.WEST, Direction.NORTHWEST], // 0, 0
        [Direction.WEST],                                       // 0, 1
        [Direction.SOUTH, Direction.WEST, Direction.SOUTHWEST], // 0, 2
    ], [
        [Direction.NORTH],                                      // 1, 0
        [Direction.NULL],                                       // 1, 1
        [Direction.SOUTH],                                      // 1, 2
    ], [
        [Direction.NORTH, Direction.EAST, Direction.NORTHEAST], // 2, 0
        [Direction.EAST],                                       // 2, 1
        [Direction.SOUTH, Direction.EAST, Direction.SOUTHEAST], // 2, 2
    ]
]


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
        const noiseLayer = this.#layers.noise
        const isLandBlock = surfaceLayer.isLand(worldPoint)
        const isBorderBlock = surfaceLayer.isBorder(worldPoint)
        // scale coordinate to block grid
        const basePoint = Point.multiplyScalar(worldPoint, chunkSize)
        return Matrix.fromSize(chunkSize, point => {
            // const [x, y] = point  // point is on range 0:2
            // let waterSides = 0
            // let landSides = 0
            // for (const direction of GRID_DIR_MASK[x][y]) {  // get directions to check
            //     // axis is a identity point, sum to world point to get neighbor tiles
            //     const sidePoint = Point.plus(worldPoint, direction.axis)
            //     if (surfaceLayer.isLand(sidePoint))
            //         landSides++
            //     else
            //     waterSides++
            // }
            const chunkPoint = Point.plus(basePoint, point)
            // if (worldPoint[0] == 37 && worldPoint[1] == 32)
            //     console.log(point, ` has ${landSides} land sides and ${waterSides} waters`);
            const noise = noiseLayer.get4D(this.#chunkRect, chunkPoint, 'outline')
            // if (! isLandBlock) return 0
            // if (! isBorderBlock) return 2
            if (noise > .6 && noise <= .7) return 3
            if (noise > .6) {
                return 2
            }
            return 1
        })
    }

    get(point) {
        const id = this.#matrix.get(point)
        let color = {
            0: '#144c68',
            1: '#216384',
            2: '#71b13e',
            3: '#518329',
        }[id]
        return {id, color: Color.fromHex(color)}
    }

    isWater(point) {
        return this.get(point) == 0
    }
}