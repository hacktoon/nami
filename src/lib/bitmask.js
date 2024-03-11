
export class BitMask {
    #code

    constructor(code=0) {
        this.#code = code
    }

    get code() {
        return this.#code
    }

    set(flag) {
        this.#code |= flag
    }

    unset(flag) {
        this.#code &= ~flag
    }

    toggle(flag) {
        this.#code ^= flag  // XOR
    }

    has(flag) {
        return flag === (this.#code & flag)
    }
}
