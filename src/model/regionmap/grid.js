import { Grid } from '/lib/grid'
import { RegionCell } from './region'



// FIXME: mutable object
export class RegionGrid {
    constructor(width, height) {
        this.grid = new Grid(width, height, () => new RegionCell())
        this.emptyPoints = width * height
        this.width = width
        this.height = height
    }

    get(point) {
        return this.grid.get(point)
    }

    setBorder(point) {
        const cell = this.get(point)
        if (cell.isOrigin()) return
        cell.setBorder()
    }

    isBorder(point) {
        return this.get(point).isBorder()
    }

    setValue(point, value) {
        if (! this.isEmpty(point)) return
        this.get(point).value = value
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
        return this.get(point).isEmpty()
    }

    isBlocked(point, value) {
        const cell = this.get(point)
        let isFilled = !cell.isEmpty() && !cell.isValue(value)
        let isAnotherSeed = !cell.isEmptySeed() && !cell.isSeed(value)
        return isFilled || isAnotherSeed
    }
}

