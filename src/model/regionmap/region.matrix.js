import { Matrix } from '/lib/base/matrix'


const EMPTY_VALUE = null
const NO_BORDER = null


export class RegionMapMatrix {
    constructor(width, height) {
        this.matrix = new Matrix(width, height, () => {
            return {value: EMPTY_VALUE, border: NO_BORDER}
        })
    }

    get(point) {
        return this.matrix.get(point).value
    }

    getBorder(point) {
        return this.matrix.get(point).border
    }

    isValue(point, value) {
        return this.matrix.get(point).value === value
    }

    setValue(point, value) {
        return this.matrix.get(point).value = value
    }

    isEmpty(point) {
        return this.matrix.get(point).value === EMPTY_VALUE
    }

    isBorder(point) {
        return this.matrix.get(point).border !== NO_BORDER
    }

    setBorder(point, neighborValue) {
        return this.matrix.get(point).border = neighborValue
    }
}