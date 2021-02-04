import { Grid } from '/lib/grid'
import { Point } from '/lib/point'
import { BaseFloodFill } from '/lib/flood-fill/base'

function createGrid(p) {
    return new Grid(p.x * 2 + 1, p.y * 2 + 1, () => 0)
}

function createBaseFill(origin, grid) {
    return new BaseFloodFill(origin, {
        isEmpty:  point => grid.get(point) === 0,
        setValue: point => grid.set(point, 1)
    })
}


test('origin point is filled', () => {
    const origin = new Point(4, 4)
    const grid = createGrid(origin)
    const fill = createBaseFill(origin, grid)
    const pointAt = (x, y) => origin.plus(new Point(x, y))

    fill.grow()
    expect(grid.get(pointAt(-1, 0))).toBe(1)
    expect(grid.get(pointAt(1, 0))).toBe(1)
    expect(grid.get(pointAt(0, -1))).toBe(1)
    expect(grid.get(pointAt(0, 1))).toBe(1)
})
