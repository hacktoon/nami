import { Grid } from '/lib/grid'


const EMPTY_VALUE = null
const TYPE_NORMAL = 1
const TYPE_ORIGIN = 2
const TYPE_BORDER = 3


export class RegionGrid {
    constructor(width, height) {
        this.grid = new Grid(width, height, () => new GridItem())
        this.emptyPoints = width * height
        this.width = width
        this.height = height
    }

    set(point, value, type=TYPE_NORMAL) {
        if (! this.isEmpty(point)) return
        this.grid.set(point, new GridItem(value, type))
        this.emptyPoints--
    }

    setOrigin(point, value) {
        this.set(point, value, TYPE_ORIGIN)
    }

    setBorder(point, value) {
        this.set(point, value, TYPE_BORDER)
    }

    get(point) {
        return this.grid.get(point)
    }

    isEmpty(point) {
        return this.get(point).value === EMPTY_VALUE
    }

    hasEmptyPoints() {
        return this.emptyPoints > 0
    }
}


class GridItem {
    constructor(value=EMPTY_VALUE, type=TYPE_NORMAL) {
        this.value = value
        this.type = type
    }
}