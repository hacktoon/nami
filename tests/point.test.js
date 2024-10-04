import { expect, test } from 'vitest'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'
import { Rect } from '/src/lib/geometry/rect'
import { PointArraySet } from '/src/lib/point/set'


test("point multiplication", () => {
    const point = [1, 2]
    const multiplied = Point.multiplyScalar(point, 2)
    expect(multiplied).toStrictEqual([2, 4])
})


test("point multiplication second parameter", () => {
    const point = [1, 2]
    const multiplied = Point.multiplyScalar(point, 2, 4)
    expect(multiplied).toStrictEqual([2, 8])
})


//////////////////////////////////////////////////////
// PointArraySet
//////////////////////////////////////////////////////


test("Empty PointArraySet has size zero", () => {
    const rect = new Rect(1, 1)
    const ptIndexSet = new PointArraySet(rect)
    expect(ptIndexSet.size).toBe(1)
})


test("PointArraySet with points has size x", () => {
    const rect = new Rect(2, 2)
    const ptIndexSet = new PointArraySet(rect)
    expect(ptIndexSet.size).toBe(4)
})


test("PointArraySet add same item", () => {
    const rect = new Rect(2, 2)
    const ptIndexSet = new PointArraySet(rect)
    ptIndexSet.add([0, 0])
    ptIndexSet.add([0, 0])
    expect(ptIndexSet.has([0, 0])).toBe(true)
    expect(ptIndexSet.size).toBe(4)
})


test("PointArraySet has a point", () => {
    const rect = new Rect(2, 2)
    const ptIndexSet = new PointArraySet(rect)
    expect(ptIndexSet.has([0, 0])).toBe(true)
    expect(ptIndexSet.has([0, 1])).toBe(true)
    expect(ptIndexSet.has([0, 2])).toBe(false)
    expect(ptIndexSet.has([1, 2])).toBe(false)
})


test("PointArraySet delete", () => {
    const rect = new Rect(2, 2)
    const ptIndexSet = new PointArraySet(rect)
    ptIndexSet.delete([0, 0])
    expect(ptIndexSet.has([0, 0])).toBe(false)
})


test("PointArraySet delete same item", () => {
    const rect = new Rect(2, 2)
    const ptIndexSet = new PointArraySet(rect)
    ptIndexSet.delete([0, 0])
    ptIndexSet.delete([0, 0])
    expect(ptIndexSet.size).toBe(3)
})


test("PointArraySet random", () => {
    const rect = new Rect(2, 2)
    const ptIndexSet = new PointArraySet(rect)
    const rndPoint = ptIndexSet.random()
    expect(ptIndexSet.has(rndPoint)).toBe(true)
    ptIndexSet.delete(rndPoint)
    expect(ptIndexSet.has(rndPoint)).toBe(false)
})


test("PointArraySet build from Rect", () => {
    const rect = new Rect(2, 2)
    const ptIndexSet = new PointArraySet(rect)
    expect(ptIndexSet.has([0, 0])).toBe(true)
    expect(ptIndexSet.has([0, 1])).toBe(true)
    expect(ptIndexSet.has([1, 0])).toBe(true)
    expect(ptIndexSet.has([1, 1])).toBe(true)
    expect(ptIndexSet.has([1, 2])).toBe(false)
})


test("PointArraySet forEach", () => {
    const rect = new Rect(2, 2)
    const ptIndexSet = new PointArraySet(rect)
    ptIndexSet.forEach(point => {
        expect(point).toStrictEqual([point[0], point[1]])
    })
})


test("Point at a direction relative to another on north", () => {
    const point = Point.atDirection([0, 0], Direction.NORTH)
    expect(point).toStrictEqual([0, -1])
})


test("Point at a direction relative to another on west", () => {
    const point = Point.atDirection([-2, 0], Direction.WEST)
    expect(point).toStrictEqual([-3, 0])
})

