import { interpolateNumbers, clamp, sum, Rect } from '.'
import { Point } from '/lib/point'


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
    const point = new Rect(40, 40).wrap(new Point(41, 40))
    expect(point.x).toBe(1)
    expect(point.y).toBe(0)
})


test('rect wrapping negative point', () => {
    const point = new Rect(10, 10).wrap(new Point(-2, -1))
    expect(point.x).toBe(8)
    expect(point.y).toBe(9)
})


test('rect area', () => {
    const point = new Rect(10, 10)
    expect(point.area).toBe(100)
})
