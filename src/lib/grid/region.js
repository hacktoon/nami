import { Grid } from './'


const EMPTY_VALUE = null
const TYPE_NORMAL = 1
const TYPE_ORIGIN = 2
const TYPE_BORDER = 3


export class RegionGrid {
    constructor(width, height) {
        this.grid = new Grid(width, height, () => new Cell())
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

    isEmpty(point) {
        return this.get(point).value === EMPTY_VALUE
    }

    isOrigin(point) {
        return this.get(point).isOrigin()
    }

    isBorder(point) {
        return this.get(point).isBorder()
    }

    getLayer(point) {
        return this.get(point).layer
    }

    isValue(point, value) {
        return this.get(point).isValue(value)
    }

    hasEmptyPoints() {
        return this.emptyPoints > 0
    }
}


class Cell {
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

    isValue(value) {
        return this.value === value
    }
}