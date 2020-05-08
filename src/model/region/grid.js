import { Grid } from '/lib/grid'


const EMPTY_GRID_POINT = -1


export class RegionGrid {
    constructor(width, height) {
        this.grid = new Grid(width, height, () => EMPTY_GRID_POINT)
        this.emptyPoints = width * height
    }

    set(point, value) {
        if (! this.isEmpty(point)) return
        this.grid.set(point, value)
        this.emptyPoints--
    }

    get(point) {
        return this.grid.get(point)
    }

    isEmpty(point) {
        return this.get(point) == EMPTY_GRID_POINT
    }

    hasEmptyPoints() {
        return this.emptyPoints > 0
    }
}