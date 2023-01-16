import { expect, test } from 'vitest'
import { BitMask } from '/src/lib/bitmask'


const FLAG_A = 1
const FLAG_B = 2
const FLAG_C = 4
const FLAG_D = 8
const FLAG_E = 16


test("Flag setting", () => {
    let bitmask = new BitMask()
    bitmask.set(FLAG_C)
    bitmask.set(FLAG_E)
    expect(bitmask.has(20)).toBeTruthy()
    bitmask.set(FLAG_A)
    expect(bitmask.has(21)).toBeTruthy()
})

test("Flag unsetting", () => {
    let bitmask = new BitMask()
    bitmask.set(FLAG_C)
    bitmask.set(FLAG_E)
    bitmask.set(FLAG_A)
    bitmask.unset(FLAG_C)
    expect(bitmask.has(17)).toBeTruthy()
})

test("Flag toggle", () => {
    let bitmask = new BitMask()
    bitmask.set(FLAG_B)
    bitmask.toggle(FLAG_D)
    expect(bitmask.has(10)).toBeTruthy()
    bitmask.toggle(FLAG_B)
    expect(bitmask.has(8)).toBeTruthy()
})
