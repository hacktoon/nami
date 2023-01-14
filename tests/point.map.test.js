import { expect, it } from 'vitest'
import { PointMap } from '/src/lib/point/map'


it("Creates a PointMap", () => {
    const pointMap = new PointMap()
    expect(pointMap.get([1, 2])).toBe(undefined)
    pointMap.set([1, 2], 4)
    expect(pointMap.get([1, 2])).toBe(4)
})


it("Delete a PointMap", () => {
    const pointMap = new PointMap()
    pointMap.set([1, 2], 4)
    console.log(pointMap.delete([1, 2]))
    expect(pointMap.get([1, 2])).toBe(undefined)
})
