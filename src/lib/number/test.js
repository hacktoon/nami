import { interpolateNumbers, clamp, sum } from '.'


test('adds 1 + 2 to equal 3', () => {
    expect(sum([1, 2])).toBe(3)
})


test('number interpolation', () => {
    const list = interpolateNumbers(1, 4, 4)
    expect(list).toStrictEqual([1, 2, 3, 4])
})


test('clamping', () => {
    expect(clamp(10, 0, 4)).toBe(4)
    expect(clamp(-3, 1, 4)).toBe(1)
})
