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
    #map = new Map([
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
        const bitmask = new BitMask(this.#grid.get(point))
        // select flagged directions only
        for(let [directionId, flag] of this.#map.entries()) {
            if (bitmask.has(flag)) {
                dirs.push(Direction.fromId(directionId))
            }
        }
        return dirs
    }

    add(point, direction) {
        const bitmask = new BitMask(this.#grid.get(point))
        bitmask.set(this.#map.get(direction.id))
        this.#grid.set(point, bitmask.code)
    }

    has(point, direction) {
        const bitmask = new BitMask(this.#grid.get(point))
        const flag = this.#map.get(direction.id)
        return bitmask.has(flag)
    }
}