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
    const point = Rect.wrap(new Point(40, 40), 40, 40)
    expect(point.x).toBe(0)
    expect(point.y).toBe(0)
})
