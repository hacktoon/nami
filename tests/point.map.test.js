import { expect, test } from 'vitest'
import { PointMap } from '/src/lib/point/map'


test("Creates a PointMap", () => {
    const pointMap = new PointMap()
    expect(pointMap.get([1, 2])).toBe(undefined)
    pointMap.set([1, 2], 4)
    expect(pointMap.get([1, 2])).toBe(4)
})


test("Delete a PointMap", () => {
    const pointMap = new PointMap()
    pointMap.set([1, 2], 4)
    pointMap.delete([1, 2])
    expect(pointMap.get([1, 2])).toBe(undefined)
})
