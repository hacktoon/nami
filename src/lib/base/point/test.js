import { Point } from '/lib/base/point'


test("point multiplication", () => {
    const point = new Point(1, 2)
    const multiplied = point.multiplyScalar(2)
    expect(multiplied.x).toBe(2)
    expect(multiplied.y).toBe(4)
})


test("point multiplication second parameter", () => {
    const point = new Point(1, 2)
    const multiplied = point.multiplyScalar(2, 4)
    expect(multiplied.x).toBe(2)
    expect(multiplied.y).toBe(8)
})