import { Point } from '/lib/point'
import { PointIndexMap } from '/lib/point/map'


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
// PointIndexMap
//////////////////////////////////////////////////////

const POINT_SET = [
    [0, 0], [0, 1], [0, 2]
]


test("Empty PointIndexMap has size zero", () => {
    const ptIndexMap = new PointIndexMap()
    expect(ptIndexMap.size).toBe(0)
})


test("PointIndexMap with points has size x", () => {
    const ptIndexMap = new PointIndexMap(POINT_SET)
    expect(ptIndexMap.size).toBe(POINT_SET.length)
})


test("PointIndexMap has a point", () => {
    const ptIndexMap = new PointIndexMap(POINT_SET)
    expect(ptIndexMap.has([0, 0])).toBe(true)
    expect(ptIndexMap.has([0, 1])).toBe(true)
    expect(ptIndexMap.has([0, 2])).toBe(true)
    expect(ptIndexMap.has([1, 2])).toBe(false)
})


test("PointIndexMap delete", () => {
    const ptIndexMap = new PointIndexMap(POINT_SET)
    ptIndexMap.delete([0, 0])
    expect(ptIndexMap.has([0, 0])).toBe(false)
})


test("PointIndexMap random", () => {
    const ptIndexMap = new PointIndexMap(POINT_SET)
    const rndPoint = ptIndexMap.random()
    expect(ptIndexMap.has(rndPoint)).toBe(true)
    ptIndexMap.delete(rndPoint)
    expect(ptIndexMap.has(rndPoint)).toBe(false)
})
