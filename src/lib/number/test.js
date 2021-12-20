import { interpolateNumbers, clamp, sum, Rect } from '.'


test('int array sum', () => {
    expect(sum([1, 2])).toBe(3)
})


test('number interpolation', () => {
    const list = interpolateNumbers(1, 4, 4)
    expect(list).toEqual([1, 2, 3, 4])
})


test('clamping', () => {
    expect(clamp(10, 0, 4)).toBe(4)
    expect(clamp(-3, 1, 4)).toBe(1)
})


test('rect wrapping', () => {
    const point = new Rect(40, 40).wrap([41, 40])
    expect(point[0]).toBe(1)
    expect(point[1]).toBe(0)
})


test('rect wrapping negative point', () => {
    const point = new Rect(10, 10).wrap([-2, -1])
    expect(point[0]).toBe(8)
    expect(point[1]).toBe(9)
})


test('rect area', () => {
    const point = new Rect(10, 12)
    expect(point.area).toBe(120)
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


test('rect nearest unwrapping', () => {
    const rect = new Rect(10, 10)
    expect(rect.unwrapNearest([9, 9], [1, 1])).toStrictEqual([11, 11])
    expect(rect.unwrapNearest([2, 4], [9, 1])).toStrictEqual([-1, 1])
    expect(rect.unwrapNearest([5, 1], [9, 8])).toStrictEqual([9, -2])
})
