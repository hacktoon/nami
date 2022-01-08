import { Point } from '/lib/point'
import { Rect } from '/lib/number'
import { PointIndexSet } from '/lib/point/set'


test("point multiplication", () => {
    const point = [1, 2]
    const multiplied = Point.multiplyScalar(point, 2)
    expect(multiplied[0]).toBe(2)
    expect(multiplied[1]).toBe(4)
})


test("point multiplication second parameter", () => {
    const point = [1, 2]
    const multiplied = Point.multiplyScalar(point, 2, 4)
    expect(multiplied[0]).toBe(2)
    expect(multiplied[1]).toBe(8)
})


//////////////////////////////////////////////////////
// PointIndexSet
//////////////////////////////////////////////////////

const POINT_SET = [
    [0, 0], [0, 1], [0, 2]
]


test("Empty PointIndexSet has size zero", () => {
    const ptIndexSet = new PointIndexSet()
    expect(ptIndexSet.size).toBe(0)
})


test("PointIndexSet with points has size x", () => {
    const ptIndexSet = new PointIndexSet(POINT_SET)
    expect(ptIndexSet.size).toBe(POINT_SET.length)
})


test("PointIndexSet add same item", () => {
    const ptIndexSet = new PointIndexSet()
    ptIndexSet.add([0, 0])
    ptIndexSet.add([0, 0])
    expect(ptIndexSet.has([0, 0])).toBe(true)
    expect(ptIndexSet.size).toBe(1)
})


test("PointIndexSet has a point", () => {
    const ptIndexSet = new PointIndexSet(POINT_SET)
    expect(ptIndexSet.has([0, 0])).toBe(true)
    expect(ptIndexSet.has([0, 1])).toBe(true)
    expect(ptIndexSet.has([0, 2])).toBe(true)
    expect(ptIndexSet.has([1, 2])).toBe(false)
})


test("PointIndexSet delete", () => {
    const ptIndexSet = new PointIndexSet(POINT_SET)
    ptIndexSet.delete([0, 0])
    expect(ptIndexSet.has([0, 0])).toBe(false)
})

test("PointIndexSet delete same item", () => {
    const ptIndexSet = new PointIndexSet(POINT_SET)
    ptIndexSet.delete([0, 0])
    ptIndexSet.delete([0, 0])
    expect(ptIndexSet.size).toBe(POINT_SET.length - 1)
})


test("PointIndexSet random", () => {
    const ptIndexSet = new PointIndexSet(POINT_SET)
    const rndPoint = ptIndexSet.random()
    expect(ptIndexSet.has(rndPoint)).toBe(true)
    ptIndexSet.delete(rndPoint)
    expect(ptIndexSet.has(rndPoint)).toBe(false)
})


test("PointIndexSet build from Rect", () => {
    const rect = new Rect(2, 2)
    const ptIndexSet = PointIndexSet.fromRect(rect)
    expect(ptIndexSet.has([0, 0])).toBe(true)
    expect(ptIndexSet.has([0, 1])).toBe(true)
    expect(ptIndexSet.has([1, 0])).toBe(true)
    expect(ptIndexSet.has([1, 1])).toBe(true)
    expect(ptIndexSet.has([1, 2])).toBe(false)
})


test("PointIndexSet forEach", () => {
    const ptIndexSet = new PointIndexSet(POINT_SET)
    let index = 0
    ptIndexSet.forEach(point => {
        expect(point).toStrictEqual(POINT_SET[index])
        index++
    })
    expect(index).toBe(POINT_SET.length)
})
