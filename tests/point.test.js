import { assert, describe, expect, it } from 'vitest'
import { Point } from '/src/lib/point'
import { Rect } from '/src/lib/number'
import { IndexedPointSet } from '/src/lib/point/set'


it("point multiplication", () => {
    const point = [1, 2]
    const multiplied = Point.multiplyScalar(point, 2)
    expect(multiplied[0]).toBe(2)
    expect(multiplied[1]).toBe(4)
})


it("point multiplication second parameter", () => {
    const point = [1, 2]
    const multiplied = Point.multiplyScalar(point, 2, 4)
    expect(multiplied[0]).toBe(2)
    expect(multiplied[1]).toBe(8)
})


//////////////////////////////////////////////////////
// IndexedPointSet
//////////////////////////////////////////////////////

const POINT_SET = [
    [0, 0], [0, 1], [0, 2]
]


it("Empty IndexedPointSet has size zero", () => {
    const ptIndexSet = new IndexedPointSet()
    expect(ptIndexSet.size).toBe(0)
})


it("IndexedPointSet with points has size x", () => {
    const ptIndexSet = new IndexedPointSet(POINT_SET)
    expect(ptIndexSet.size).toBe(POINT_SET.length)
})


it("IndexedPointSet add same item", () => {
    const ptIndexSet = new IndexedPointSet()
    ptIndexSet.add([0, 0])
    ptIndexSet.add([0, 0])
    expect(ptIndexSet.has([0, 0])).toBe(true)
    expect(ptIndexSet.size).toBe(1)
})


it("IndexedPointSet has a point", () => {
    const ptIndexSet = new IndexedPointSet(POINT_SET)
    expect(ptIndexSet.has([0, 0])).toBe(true)
    expect(ptIndexSet.has([0, 1])).toBe(true)
    expect(ptIndexSet.has([0, 2])).toBe(true)
    expect(ptIndexSet.has([1, 2])).toBe(false)
})


it("IndexedPointSet delete", () => {
    const ptIndexSet = new IndexedPointSet(POINT_SET)
    ptIndexSet.delete([0, 0])
    expect(ptIndexSet.has([0, 0])).toBe(false)
})

it("IndexedPointSet delete same item", () => {
    const ptIndexSet = new IndexedPointSet(POINT_SET)
    ptIndexSet.delete([0, 0])
    ptIndexSet.delete([0, 0])
    expect(ptIndexSet.size).toBe(POINT_SET.length - 1)
})


it("IndexedPointSet random", () => {
    const ptIndexSet = new IndexedPointSet(POINT_SET)
    const rndPoint = ptIndexSet.random()
    expect(ptIndexSet.has(rndPoint)).toBe(true)
    ptIndexSet.delete(rndPoint)
    expect(ptIndexSet.has(rndPoint)).toBe(false)
})


it("IndexedPointSet build from Rect", () => {
    const rect = new Rect(2, 2)
    const ptIndexSet = IndexedPointSet.fromRect(rect)
    expect(ptIndexSet.has([0, 0])).toBe(true)
    expect(ptIndexSet.has([0, 1])).toBe(true)
    expect(ptIndexSet.has([1, 0])).toBe(true)
    expect(ptIndexSet.has([1, 1])).toBe(true)
    expect(ptIndexSet.has([1, 2])).toBe(false)
})


it("IndexedPointSet forEach", () => {
    const ptIndexSet = new IndexedPointSet(POINT_SET)
    let index = 0
    ptIndexSet.forEach(point => {
        expect(point).toStrictEqual(POINT_SET[index])
        index++
    })
    expect(index).toBe(POINT_SET.length)
})
