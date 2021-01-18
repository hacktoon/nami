import { Point } from '/lib/point'
import { PointSet } from '/lib/point/set'


function createSet() {
    const points = [
        new Point(0, 0),
        new Point(1, 1),
        new Point(2, 2),
    ]
    return new PointSet(...points)
}


test('point set size', () => {
    const pointSet = createSet()
    expect(pointSet.size).toBe(3)
})


test('point set size after add', () => {
    const pointSet = createSet()
    pointSet.add(new Point(4, 4))
    expect(pointSet.size).toBe(4)
})


test('point set size after delete', () => {
    const pointSet = createSet()
    pointSet.delete(new Point(0, 0))
    expect(pointSet.size).toBe(2)
})


test('point set has point after add', () => {
    const pointSet = createSet()
    const point = new Point(4, 4)
    pointSet.add(point)
    expect(pointSet.has(point)).toBe(true)
})


test("point set doesn't has point after delete", () => {
    const pointSet = createSet()
    const point = new Point(0, 0)
    pointSet.delete(point)
    expect(pointSet.has(point)).toBe(false)
})


test("point set random points", () => {
    const pointSet = createSet()
    const point = pointSet.random()
    expect([0, 1, 2]).toContain(point.x)
    expect([0, 1, 2]).toContain(point.y)
})


test("point multiplication", () => {
    const point = new Point(1, 2)
    const multiplied = point.multiply(2)
    expect(multiplied.x).toBe(2)
    expect(multiplied.y).toBe(4)
})


test("point multiplication second parameter", () => {
    const point = new Point(1, 2)
    const multiplied = point.multiply(2, 4)
    expect(multiplied.x).toBe(2)
    expect(multiplied.y).toBe(8)
})