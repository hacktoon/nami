import { Point } from '/lib/point'
import { PointHash } from '/lib/point/hash'


function createHash() {
    const points = [
        new Point(0, 0),
        new Point(1, 1),
        new Point(2, 2),
    ]
    return new PointHash(...points)
}


test('hash size', () => {
    const hash = createHash()
    expect(hash.size).toBe(3)
})


test('hash size after add', () => {
    const hash = createHash()
    hash.add(new Point(4, 4))
    expect(hash.size).toBe(4)
})


test('hash size after delete', () => {
    const hash = createHash()
    hash.delete(new Point(0, 0))
    expect(hash.size).toBe(2)
})


test('hash has point after add', () => {
    const hash = createHash()
    const point = new Point(4, 4)
    hash.add(point)
    expect(hash.has(point)).toBe(true)
})


test("hash doesn't has point after delete", () => {
    const hash = createHash()
    const point = new Point(0, 0)
    hash.delete(point)
    expect(hash.has(point)).toBe(false)
})