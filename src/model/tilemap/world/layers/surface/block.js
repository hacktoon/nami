import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { Random } from '/src/lib/random'
import { Rect } from '/src/lib/number'
import { Matrix } from '/src/lib/matrix'


const SIZE = 3


export class SurfaceBlockMap {
    #world
    #layers
    #matrix
    #surface

    constructor(world, surface, worldPoint) {
        this.#world = world
        this.#layers = world.layers
        this.worldPoint = worldPoint
        this.#surface = surface
        this.size = SIZE
        this.#matrix = this.#buildSurface(SIZE)
        // seed is fixed for current block point
    }

    #buildSurface(blockSize) {
        const noiseLayer = this.#layers.noise
        const isLandBlock = this.#layers.surface.isLand(this.worldPoint)
        const isBorderBlock = this.#layers.surface.isBorder(this.worldPoint)
        const blockRect = new Rect(
            this.#world.width * blockSize,
            this.#world.height * blockSize,
        )
        // scale coordinate to block grid
        const basePoint = Point.multiplyScalar(this.worldPoint, blockSize)
        return Matrix.fromSize(blockSize, point => {
            const blockPoint = Point.plus(basePoint, point)
            const noise = noiseLayer.get4D(blockRect, blockPoint, 'outline')
            if (isLandBlock) {
                if (isBorderBlock) {
                    return noise > .6 ? 1 : 0
                }
                return 1
            }
            return noise > .6 ? 1 : 0
        })
    }

    get(point) {
        const id = this.#matrix.get(point)
        let color = {
            0: '#216384',
            1: '#71b13e',
        }[id]
        return {id, color: Color.fromHex(color)}
    }

    isWater(point) {
        return this.get(point) == 0
    }
}