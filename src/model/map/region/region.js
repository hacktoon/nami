
const EMPTY_VALUE = null
const NO_BORDER = null


export class RegionCell {
    constructor(value=EMPTY_VALUE, border=NO_BORDER) {
        this.value = value
        this.border = border
    }

    getValue() {
        return this.value
    }

    getBorder() {
        return this.border
    }

    isValue(value) {
        return this.value === value
    }

    isEmpty() {
        return this.value === EMPTY_VALUE
    }

    isBorder() {
        return this.border !== NO_BORDER
    }

    setValue(value) {
        return this.value = value
    }

    setBorder(border) {
        return this.border = border
    }
}
