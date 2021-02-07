import { Grid } from '/lib/grid'
import { Point } from '/lib/point'
import { BaseFloodFill } from '/lib/floodfill'

function createGrid(p, factor=2) {
    return new Grid(p.x * factor + 1, p.y * factor + 1, () => 0)
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

    const grown = fill.grow()
    expect(grid.get(pointAt(0, 0))).toBe(1)
    expect(grid.get(pointAt(-1, 0))).toBe(1)
    expect(grid.get(pointAt(1, 0))).toBe(1)
    expect(grid.get(pointAt(0, -1))).toBe(1)
    expect(grid.get(pointAt(0, 1))).toBe(1)
    expect(grown.length).toBe(4)
})


test('origin point is filled on layer 2', () => {
    const origin = new Point(4, 4)
    const grid = createGrid(origin)
    const fill = createBaseFill(origin, grid)

    const layerCount1 = fill.grow()
    const layerCount2 = fill.grow()
    const layerCount3 = fill.grow()
    expect(layerCount1.length).toBe(4)
    expect(layerCount2.length).toBe(8)
    expect(layerCount3.length).toBe(12)
})
