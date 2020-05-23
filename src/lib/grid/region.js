import { Grid } from './'


const EMPTY_VALUE = null
const EMPTY_SEED = null
const TYPE_NORMAL = 1
const TYPE_ORIGIN = 2
const TYPE_BORDER = 3


export class RegionGrid {
    constructor(width, height) {
        this.grid = new Grid(width, height, () => new GridCell())
        this.emptyPoints = width * height
        this.width = width
        this.height = height
    }

    get(point) {
        return this.grid.get(point)
    }

    setOrigin(point) {
        this.get(point).type = TYPE_ORIGIN
    }

    setBorder(point) {
        const item = this.get(point)
        if (item.type != TYPE_ORIGIN)
            item.type = TYPE_BORDER
    }

    setValue(point, value) {
        if (! this.isEmpty(point)) return
        this.grid.get(point).value = value
        this.emptyPoints--
    }

    setLayer(point, layer) {
        this.get(point).layer = layer
    }

    setSeed(point, value) {
        this.get(point).seed = value
    }

    isSeed(point, value) {
        return this.get(point).isSeed(value)
    }

    isEmpty(point) {
        return this.get(point).isValue(EMPTY_VALUE)
    }

    isOrigin(point) {
        return this.get(point).isOrigin()
    }

    isBorder(point) {
        return this.get(point).isBorder()
    }

    isValue(point, value) {
        return this.get(point).isValue(value)
    }

    getLayer(point) {
        return this.get(point).layer
    }

    hasEmptyPoints() {
        return this.emptyPoints > 0
    }
}


class GridCell {
    constructor() {
        this.layer = 0
        this.value = EMPTY_VALUE
        this.type  = TYPE_NORMAL
        this.seed  = EMPTY_SEED
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

    isValue(value) {
        return this.value === value
    }

    isSeed(value) {
        return this.seed === value
    }
}