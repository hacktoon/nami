import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { Random } from '/src/lib/random'
import { Rect } from '/src/lib/number'
import { Matrix } from '/src/lib/matrix'


export class BlockMap {
    #world
    #resolution
    #layers
    #surfaceMatrix

    constructor(world, resolution, worldPoint) {
        this.#world = world
        this.#layers = world.layers
        this.#resolution = resolution  // int like 3x3, 9x9, etc
        this.worldPoint = worldPoint
        this.#surfaceMatrix = this.#buildSurface()
        // seed is fixed for current block point
    }

    get resolution() {
        return this.#resolution
    }

    #buildSurface() {
        const noiseLayer = this.#layers.noise
        const isLandBlock = this.#layers.surface.isLand(this.worldPoint)
        const isBorderBlock = this.#layers.surface.isBorder(this.worldPoint)
        const blockRect = new Rect(
            this.#world.width * this.#resolution,
            this.#world.height * this.#resolution,
        )
        // scale coordinate to block grid
        const basePoint = Point.multiplyScalar(this.worldPoint, this.#resolution)
        return Matrix.fromSize(this.#resolution, point => {
            const blockPoint = Point.plus(basePoint, point)
            const noise = noiseLayer.get4D(blockRect, blockPoint, 'outline')
            if (isLandBlock) {
                if (isBorderBlock) {
                    return noise > .6 ? 1 : 0
                }
                return noise > .7 ? 2 : 1
            }
            return noise > .7 ? 1 : 0
        })
    }

    getSurface(point) {
        const id = this.#surfaceMatrix.get(point)
        let color = {
            0: '#216384',
            1: '#71b13e',
            2: '#c5ed7d',
        }[id]
        return {id, color: Color.fromHex(color)}
    }

    isWater(point) {
        return this.get(point) == 0
    }

    isMountain(point) {
        return this.get(point) == 2
    }
}