import { Matrix } from '/lib/base/matrix'


const EMPTY_VALUE = null


export class RegionMapMatrix {
    constructor(width, height) {
        this.matrix = new Matrix(width, height, () => {
            return {value: EMPTY_VALUE, border: false}
        })
    }

    get(point) {
        return this.matrix.get(point).value
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
        return this.matrix.get(point).border === true
    }

    setBorder(point) {
        return this.matrix.get(point).border = true
    }
}