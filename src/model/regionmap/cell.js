const EMPTY_VALUE = null
const EMPTY_SEED = null
const TYPE_NORMAL = 1
const TYPE_BORDER = 2


export class RegionCell {
    #isOrigin = false
    #type     = TYPE_NORMAL

    constructor() {
        this.layer    = 0
        this.value    = EMPTY_VALUE
        this.seed     = EMPTY_SEED
        this.neighbor = null
    }

    isOrigin() {
        return this.#isOrigin
    }

    isBorder() {
        return this.#type === TYPE_BORDER
    }

    isLayer(layer) {
        return this.layer === layer
    }

    isValue(value) {
        return this.value === value
    }

    isEmpty() {
        return this.isValue(EMPTY_VALUE)
    }

    isSeed(value) {
        return this.seed === value
    }

    isEmptySeed() {
        return this.seed === EMPTY_SEED
    }

    setOrigin() {
        this.#isOrigin = true
    }

    setLayer(layer) {
        this.layer = layer
    }

    setBorder() {
        this.#type = TYPE_BORDER
    }

    setSeed(value) {
        this.seed = value
    }

    setValue(value) {
        if (this.isEmpty())
            this.value = value
    }
}