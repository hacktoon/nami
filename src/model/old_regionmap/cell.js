const NO_REGION = null
const EMPTY_SEED = null
const TYPE_NORMAL = 1
const TYPE_BORDER = 2


export class RegionCell {
    #isOrigin = false
    #type     = TYPE_NORMAL
    #region   = NO_REGION
    #seed     = EMPTY_SEED
    #layer    = 0

    get region() {
        if (this.#region === NO_REGION) {
            return this.#seed
        }
        return this.#region
    }

    get layer() {
        return this.#layer
    }

    isOrigin() {
        return this.#isOrigin
    }

    isBorder() {
        return this.#type === TYPE_BORDER
    }

    isLayer(layer) {
        return this.#layer === layer
    }

    isRegion(region) {
        if (this.isEmpty()) return false
        return this.#region.id === region.id
    }

    // TODO: remove, use SelectField of regions
    isRegionId(id) {
        if (this.isEmpty()) return false
        return this.#region.id === id
    }

    isEmpty() {
        return this.#region === NO_REGION
    }

    isSeed(region) {
        if (this.isEmptySeed()) return false
        return this.#seed === region.id
    }

    isEmptySeed() {
        return this.#seed === EMPTY_SEED
    }

    setOrigin() {
        this.#isOrigin = true
    }

    setLayer(layer) {
        this.#layer = layer
    }

    setBorder(neighbor) {
        this.#type = TYPE_BORDER
    }

    setSeed(region) {
        this.#seed = region.id
    }

    setRegion(region) {
        if (this.isEmpty())
            this.#region = region
    }

    isNeighbor(neighborRegion) {
        let isFilled = !this.isEmpty() && !this.isRegion(neighborRegion)
        let isAnotherSeed = !this.isEmptySeed() && !this.isSeed(neighborRegion)
        return isFilled || isAnotherSeed
    }
}