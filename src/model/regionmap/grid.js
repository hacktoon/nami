import { Grid } from '/lib/grid'


const EMPTY_VALUE = null
const EMPTY_SEED = null
const TYPE_NORMAL = 1
const TYPE_ORIGIN = 2
const TYPE_BORDER = 3


// FIXME: mutable object
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

    isOrigin(point) {
        return this.get(point).isOrigin()
    }

    setBorder(point, neighbor) {
        const cell = this.get(point)
        if (cell.type == TYPE_ORIGIN) return
        cell.type = TYPE_BORDER
    }

    isBorder(point) {
        return this.get(point).isBorder()
    }

    setValue(point, value) {
        if (! this.isEmpty(point)) return
        this.grid.get(point).value = value
        this.emptyPoints--
    }

    isValue(point, value) {
        return this.get(point).isValue(value)
    }

    setLayer(point, layer) {
        this.get(point).layer = layer
    }

    getLayer(point) {
        return this.get(point).layer
    }

    isLayer(point, layer) {
        return this.get(point).isLayer(layer)
    }

    setSeed(point, value) {
        this.get(point).seed = value
    }

    isSeed(point, value) {
        return this.get(point).isSeed(value)
    }

    hasEmptyPoints() {
        return this.emptyPoints > 0
    }

    isEmpty(point) {
        return this.get(point).isValue(EMPTY_VALUE)
    }

    isBlocked(point, value) {
        let isFilled = !this.isEmpty(point) && !this.isValue(point, value)
        let otherSeed = !this.isSeed(point, EMPTY_SEED) && !this.isSeed(point, value)
        return isFilled || otherSeed
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