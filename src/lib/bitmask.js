import { Direction } from '/src/lib/direction'


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


export class DirectionBitMask {
    #bitmask
    // bitmask value => point in matrix 3x3
    /*
        1(N)
    2(W)         8 (E)
        16(S)
    */
    // detect matrix in source file
    #map = new Map([
        [Direction.NORTH.id, 1],
        [Direction.WEST.id, 2],
        [Direction.EAST.id, 8],
        [Direction.SOUTH.id, 16],
    ])

    constructor(value=0) {
        this.#bitmask = new BitMask(value)
    }

    get value() {
        return this.#bitmask.value
    }

    set(flag) {
        this.#bitmask.set(flag)
    }

    unset(flag) {
        this.#bitmask.unset(flag)
    }

    toggle(flag) {
        this.#bitmask.toggle(flag)
    }

    has(flag) {
        return this.#bitmask.has(flag)
    }
}