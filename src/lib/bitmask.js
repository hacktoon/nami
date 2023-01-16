
const NO_STATUS = 0
const ACTIVE = 1 // 2^0
const ADMIN = 2 // 2^1
const EMAIL_VERIFIED = 4 // 2^2
const PAYMENT_VERIFIED = 8 // 2^3
const TFA_ENABLED = 16 // 2^4


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
        return this.#value === (this.#value & flag)
    }
}


export function setFlag(value, flag) {
    return value | flag
}