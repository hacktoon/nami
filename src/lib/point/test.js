import { Point } from '/lib/point'
import { Rect } from '/lib/number'
import { PointMap } from '/lib/point/map'


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
// PointMap
//////////////////////////////////////////////////////

const POINT_SET = [
    [0, 0], [0, 1], [0, 2]
]


test("Empty PointMap has size zero", () => {
    const ptIndexMap = new PointMap()
    expect(ptIndexMap.size).toBe(0)
})


test("PointMap with points has size x", () => {
    const ptIndexMap = new PointMap(POINT_SET)
    expect(ptIndexMap.size).toBe(POINT_SET.length)
})


test("PointMap add same item", () => {
    const ptIndexMap = new PointMap()
    ptIndexMap.add([0, 0])
    ptIndexMap.add([0, 0])
    expect(ptIndexMap.has([0, 0])).toBe(true)
    expect(ptIndexMap.size).toBe(1)
})


test("PointMap has a point", () => {
    const ptIndexMap = new PointMap(POINT_SET)
    expect(ptIndexMap.has([0, 0])).toBe(true)
    expect(ptIndexMap.has([0, 1])).toBe(true)
    expect(ptIndexMap.has([0, 2])).toBe(true)
    expect(ptIndexMap.has([1, 2])).toBe(false)
})


test("PointMap delete", () => {
    const ptIndexMap = new PointMap(POINT_SET)
    ptIndexMap.delete([0, 0])
    expect(ptIndexMap.has([0, 0])).toBe(false)
})

test("PointMap delete same item", () => {
    const ptIndexMap = new PointMap(POINT_SET)
    ptIndexMap.delete([0, 0])
    ptIndexMap.delete([0, 0])
    expect(ptIndexMap.size).toBe(POINT_SET.length - 1)
})


test("PointMap random", () => {
    const ptIndexMap = new PointMap(POINT_SET)
    const rndPoint = ptIndexMap.random()
    expect(ptIndexMap.has(rndPoint)).toBe(true)
    ptIndexMap.delete(rndPoint)
    expect(ptIndexMap.has(rndPoint)).toBe(false)
})


test("PointMap build from Rect", () => {
    const rect = new Rect(2, 2)
    const ptIndexMap = PointMap.fromRect(rect)
    expect(ptIndexMap.has([0, 0])).toBe(true)
    expect(ptIndexMap.has([0, 1])).toBe(true)
    expect(ptIndexMap.has([1, 0])).toBe(true)
    expect(ptIndexMap.has([1, 1])).toBe(true)
    expect(ptIndexMap.has([1, 2])).toBe(false)
})
