import { Matrix } from '/lib/base/matrix'
import { Point } from '/lib/base/point'
import { FloodFill } from '/lib/floodfill'

function createGrid(p, factor=2) {
    return new Matrix(p.x * factor + 1, p.y * factor + 1, () => 0)
}

function createBaseFill(origin, matrix) {
    return new FloodFill(origin, {
        isEmpty:  point => matrix.get(point) === 0,
        setValue: point => matrix.set(point, 1)
    })
}


test('origin point is filled', () => {
    const origin = new Point(4, 4)
    const matrix = createGrid(origin)
    const fill = createBaseFill(origin, matrix)
    const pointAt = (x, y) => origin.plus(new Point(x, y))

    const grown = fill.grow()
    expect(matrix.get(pointAt(0, 0))).toBe(1)
    expect(matrix.get(pointAt(-1, 0))).toBe(1)
    expect(matrix.get(pointAt(1, 0))).toBe(1)
    expect(matrix.get(pointAt(0, -1))).toBe(1)
    expect(matrix.get(pointAt(0, 1))).toBe(1)
    expect(grown.length).toBe(4)
})


test('origin point is filled on layer 2', () => {
    const origin = new Point(4, 4)
    const matrix = createGrid(origin)
    const fill = createBaseFill(origin, matrix)

    const layerCount1 = fill.grow()
    const layerCount2 = fill.grow()
    const layerCount3 = fill.grow()
    expect(layerCount1.length).toBe(4)
    expect(layerCount2.length).toBe(8)
    expect(layerCount3.length).toBe(12)
})


test('flood fill area', () => {
    const origin = new Point(4, 4)
    const matrix = createGrid(origin)
    const fill = createBaseFill(origin, matrix)

    expect(fill.area).toBe(1)
    fill.grow()
    expect(fill.area).toBe(5)
    fill.grow()
    expect(fill.area).toBe(13)

})
