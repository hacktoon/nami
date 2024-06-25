import { Direction } from '/src/lib/direction'
import { Grid } from '/src/lib/grid'
import { BitMask } from '/src/lib/bitmask'


export class DirectionMaskGrid {
    #grid
    // bitmask code => point in matrix 3x3
    /*
        1(N)
    2(W)    8 (E)
        16(S)
    */
    // detect matrix in source file
    #dirMap = new Map([
        [Direction.NORTH.id, 1],
        [Direction.WEST.id, 2],
        [Direction.EAST.id, 8],
        [Direction.SOUTH.id, 16],
    ])

    constructor(rect) {
        // start with bitmask code = 0 (no directions flagged)
        this.#grid = Grid.fromRect(rect, () => 0)
    }

    get(point) {
        const dirs = []
        const code = this.#grid.get(point)
        const bitmask = new BitMask(code)
        // select flagged directions only
        for(let [directionId, flag] of this.#dirMap.entries()) {
            if (bitmask.has(flag)) {
                dirs.push(Direction.fromId(directionId))
            }
        }
        return dirs
    }

    getAxis(point) {
        return this.get(point).map(dir => dir.axis)
    }

    add(point, direction) {
        const code = this.#grid.get(point)
        const bitmask = new BitMask(code)
        bitmask.set(this.#dirMap.get(direction.id))
        this.#grid.set(point, bitmask.code)
    }

    has(point, direction) {
        const bitmask = new BitMask(this.#grid.get(point))
        const flag = this.#dirMap.get(direction.id)
        return bitmask.has(flag)
    }
}