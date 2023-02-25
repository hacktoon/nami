import { expect, test } from 'vitest'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'
import { Rect } from '/src/lib/number'
import { PointArraySet } from '/src/lib/point/set'


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
// PointArraySet
//////////////////////////////////////////////////////

const POINT_SET = [
    [0, 0], [0, 1], [0, 2]
]


test("Empty PointArraySet has size zero", () => {
    const ptIndexSet = new PointArraySet()
    expect(ptIndexSet.size).toBe(0)
})


test("PointArraySet with points has size x", () => {
    const ptIndexSet = new PointArraySet(POINT_SET)
    expect(ptIndexSet.size).toBe(POINT_SET.length)
})


test("PointArraySet add same item", () => {
    const ptIndexSet = new PointArraySet()
    ptIndexSet.add([0, 0])
    ptIndexSet.add([0, 0])
    expect(ptIndexSet.has([0, 0])).toBe(true)
    expect(ptIndexSet.size).toBe(1)
})


test("PointArraySet has a point", () => {
    const ptIndexSet = new PointArraySet(POINT_SET)
    expect(ptIndexSet.has([0, 0])).toBe(true)
    expect(ptIndexSet.has([0, 1])).toBe(true)
    expect(ptIndexSet.has([0, 2])).toBe(true)
    expect(ptIndexSet.has([1, 2])).toBe(false)
})


test("PointArraySet delete", () => {
    const ptIndexSet = new PointArraySet(POINT_SET)
    ptIndexSet.delete([0, 0])
    expect(ptIndexSet.has([0, 0])).toBe(false)
})

test("PointArraySet delete same item", () => {
    const ptIndexSet = new PointArraySet(POINT_SET)
    ptIndexSet.delete([0, 0])
    ptIndexSet.delete([0, 0])
    expect(ptIndexSet.size).toBe(POINT_SET.length - 1)
})


test("PointArraySet random", () => {
    const ptIndexSet = new PointArraySet(POINT_SET)
    const rndPoint = ptIndexSet.random()
    expect(ptIndexSet.has(rndPoint)).toBe(true)
    ptIndexSet.delete(rndPoint)
    expect(ptIndexSet.has(rndPoint)).toBe(false)
})


test("PointArraySet build from Rect", () => {
    const rect = new Rect(2, 2)
    const ptIndexSet = PointArraySet.fromRect(rect)
    expect(ptIndexSet.has([0, 0])).toBe(true)
    expect(ptIndexSet.has([0, 1])).toBe(true)
    expect(ptIndexSet.has([1, 0])).toBe(true)
    expect(ptIndexSet.has([1, 1])).toBe(true)
    expect(ptIndexSet.has([1, 2])).toBe(false)
})


test("PointArraySet forEach", () => {
    const ptIndexSet = new PointArraySet(POINT_SET)
    let index = 0
    ptIndexSet.forEach(point => {
        expect(point).toStrictEqual(POINT_SET[index])
        index++
    })
    expect(index).toBe(POINT_SET.length)
})


test("Point at a direction relative to another on north", () => {
    const point = Point.atDirection([0, 0], Direction.NORTH)
    expect(point).toStrictEqual([0, -1])
})


test("Point at a direction relative to another on west", () => {
    const point = Point.atDirection([-2, 0], Direction.WEST)
    expect(point).toStrictEqual([-3, 0])
})

