import { expect, test } from 'vitest'
import { PointMap } from '/src/lib/point/map'
import { Rect } from '/src/lib/geometry/rect'


test("Creates a PointMap", () => {
    const rect = new Rect(2, 2)
    const pointMap = new PointMap(rect)
    expect(pointMap.get([1, 2])).toBe(undefined)
    pointMap.set([0, 1], 4)
    expect(pointMap.get([0, 1])).toBe(4)
})


test("Delete a PointMap", () => {
    const rect = new Rect(2, 2)
    const pointMap = new PointMap(rect)
    pointMap.set([1, 1], 4)
    pointMap.delete([1, 1])
    expect(pointMap.get([1, 1])).toBe(undefined)
})
