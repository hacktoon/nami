import { Direction } from '/src/lib/direction'
import { Grid } from '/src/lib/grid'
import { BitMask } from '/src/lib/bitmask'


export class DirectionBitMaskGrid {
    // bitmask code grid => each point is a bitmask code
    // mapping zero or many directions in one integer
    #grid

    constructor(rect) {
        // start with bitmask code = 0 (no directions flagged)
        this.#grid = Grid.fromRect(rect, () => Direction.CENTER.id)
    }

    get(point) {
        const dirs = []
        const code = this.#grid.get(point)
        const bitmask = new BitMask(code)
        // select flagged directions only
        for(let direction of Direction.getAll()) {
            if (bitmask.has(direction.code)) {
                dirs.push(direction)
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
        bitmask.set(direction.code)
        this.#grid.set(point, bitmask.code)
    }

    has(point, direction) {
        const bitmask = new BitMask(this.#grid.get(point))
        return bitmask.has(direction.code)
    }
}