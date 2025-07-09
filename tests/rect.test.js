import { expect, test } from 'vitest'
import { Rect } from '/src/lib/geometry/rect'


test('rect wrapping', () => {
    const point = new Rect(40, 40).wrap([41, 40])
    expect(point[0]).toBe(1)
    expect(point[1]).toBe(0)
})


test('rect wrapping negative point', () => {
    const rect = new Rect(10, 10).wrap([-2, -1])
    expect(rect[0]).toBe(8)
    expect(rect[1]).toBe(9)
})


test('rect area', () => {
    const rect = new Rect(10, 12)
    expect(rect.area).toBe(120)
})


test('point inside rect', () => {
    const rect = new Rect(10, 10)
    expect(rect.isInside([5, 3])).toBe(true)
})


test('point outside rect', () => {
    const rect = new Rect(10, 10)
    expect(rect.isInside([15, 3])).toBe(false)
})


test('rect wrapping', () => {
    const rect = new Rect(10, 10)
    expect(rect.wrap([15, 11])).toStrictEqual([5, 1])
    expect(rect.wrap([10, -3])).toStrictEqual([0, 7])
    expect(rect.wrap([-2, 3])).toStrictEqual([8, 3])
})

