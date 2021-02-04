import { Grid } from '/lib/grid'
import { Point } from '/lib/point'
import { BaseFloodFill } from '/lib/flood-fill/base'


function createBaseFill(x, y) {
    const origin = new Point(x, y)
    const grid = new Grid(x * 2 + 1, y * 2 + 1, () => 0)
    return new BaseFloodFill(origin, {
        isEmpty:  point => grid.get(point) === 0,
        setValue: point => grid.set(point, 1)
    })
}


test('origin point is filled', () => {
    const [x, y] = [4, 4]
    const fill = createBaseFill(x, y)
    const points = fill.grow()
    expect(points[0].equals(new Point(x-1, y))).toBe(true)
    expect(points[1].equals(new Point(x+1, y))).toBe(true)
    expect(points[2].equals(new Point(x, y-1))).toBe(true)
    expect(points[3].equals(new Point(x, y+1))).toBe(true)
})
