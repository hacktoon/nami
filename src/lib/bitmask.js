export class BitMask {
    #value

    constructor(value=0) {
        this.#value = value
    }

    get value() {
        return this.#value
    }

    set(flag) {
        this.#value |= flag
    }

    unset(flag) {
        this.#value &= ~flag
    }

    toggle(flag) {
        this.#value ^= flag  // XOR
    }

    has(flag) {
        return flag === (this.#value & flag)
    }
}
