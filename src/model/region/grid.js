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

    set(point, value, type=TYPE_NORMAL, layer=0) {
        if (! this.isEmpty(point)) return
        this.grid.set(point, new GridItem(value, type, layer))
        this.emptyPoints--
    }

    setOrigin(point) {
        this.get(point).type = TYPE_ORIGIN
    }

    setBorder(point) {
        this.get(point).type = TYPE_BORDER

    }

    get(point) {
        return this.grid.get(point)
    }

    isEmpty(point) {
        return this.get(point).value === EMPTY_VALUE
    }

    isBorder(point) {
        return this.get(point).type === TYPE_BORDER
    }

    isValue(point, value) {
        return this.get(point).value === value
    }

    hasEmptyPoints() {
        return this.emptyPoints > 0
    }
}


class GridItem {
    constructor(value=EMPTY_VALUE, type=TYPE_NORMAL, layer=0) {
        this.value = value
        this.type = type
        this.layer = layer
    }

    isOrigin() {
        return this.type === TYPE_ORIGIN
    }

    isBorder() {
        return this.type === TYPE_BORDER
    }

    isLayer(layer) {
        return this.layer === layer
    }
}