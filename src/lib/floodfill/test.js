import { Matrix } from '/lib/matrix'
import { Point } from '/lib/point'
import { FloodFill } from '/lib/floodfill'


class FillConfig {
    constructor(matrix) {
        this.matrix = matrix
    }

    isEmpty(point) {
        return this.matrix.get(point) === 0
    }

    setValue(point) {
        this.matrix.set(point, 1)
    }

    checkNeighbor(adjacent, origin) {

    }

    getNeighbors(originPoint) {
        return Point.adjacents(originPoint)
    }
}


function createMatrix(p, factor=2) {
    return new Matrix(p[0] * factor + 1, p[1] * factor + 1, () => 0)
}

function createBaseFill(origin, matrix) {
    const config = new FillConfig(matrix)
    return new FloodFill(origin, config)
}


test('origin point is filled', () => {
    const origin = [4, 4]
    const matrix = createMatrix(origin)
    const fill = createBaseFill(origin, matrix)
    const pointAt = (x, y) => Point.plus(origin, [x, y])

    const grown = fill.grow()
    expect(matrix.get(pointAt(0, 0))).toBe(1)
    expect(matrix.get(pointAt(-1, 0))).toBe(1)
    expect(matrix.get(pointAt(1, 0))).toBe(1)
    expect(matrix.get(pointAt(0, -1))).toBe(1)
    expect(matrix.get(pointAt(0, 1))).toBe(1)
    expect(grown.length).toBe(4)
})


test('origin point is filled on layer 2', () => {
    const origin = [4, 4]
    const matrix = createMatrix(origin)
    const fill = createBaseFill(origin, matrix)

    const layerCount1 = fill.grow()
    const layerCount2 = fill.grow()
    const layerCount3 = fill.grow()
    expect(layerCount1.length).toBe(4)
    expect(layerCount2.length).toBe(8)
    expect(layerCount3.length).toBe(12)
})

