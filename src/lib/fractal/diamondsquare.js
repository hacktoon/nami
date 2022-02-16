import { clamp, sum } from '/src/lib/number'

import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'


const EMPTY = null


export class DiamondSquare {
    constructor(size, roughness, values) {
        this.scale  = roughness * (size - 1)
        this.matrix   = new Matrix(size, size, () => EMPTY)
        this.max    = -Infinity
        this.min    = Infinity
        this.values = values || []
        this.size   = size
        this._build()
    }

    _build() {
        this._setSeedPoints()
        for (let midSize = this.size - 1; midSize / 2 >= 1; midSize /= 2) {
            this._squareStep(midSize)
            this._diamondStep(midSize)
            this.scale /= 2
        }
    }

    _setSeedPoints() {
        const maxIndex = this.size - 1
        this._set(new Point(0, 0), this._getVariation())
        this._set(new Point(maxIndex, 0), this._getVariation())
        this._set(new Point(0, maxIndex), this._getVariation())
        this._set(new Point(maxIndex, maxIndex), this._getVariation())
    }

    _squareStep(midSize) {
        const half = midSize / 2
        const size = this.size - 1
        for (let y = half; y < size; y += midSize) {
            for (let x = half; x < size; x += midSize) {
                this._square(new Point(x, y), half)
            }
        }
    }

    _diamondStep(midSize) {
        const half = midSize / 2
        const size = this.size - 1
        for (let y = 0; y <= size; y += half) {
            for (let x = (y + half) % midSize; x <= size; x += midSize) {
                this._diamond(new Point(x, y), half)
            }
        }
    }

    _square(point, midSize) {
        const [x, y] = point
        const average = this._averagePoints([
            [x + midSize, y - midSize],   // upper right
            [x + midSize, y + midSize],   // lower right
            [x - midSize, y - midSize],   // upper left
            [x - midSize, y + midSize],   // lower left
        ])
        this._set(point, average + this._getVariation())
    }

    _diamond(point, midSize) {
        const [x, y] = point
        const average = this._averagePoints([
            [x, y - midSize],   // top
            [x, y + midSize],   // bottom
            [x + midSize, y],   // right
            [x - midSize, y],   // left
        ])
        this._set(point, average + this._getVariation())
    }

    _getVariation() {
        return Random.int(-this.scale, this.scale)
    }

    _averagePoints(points) {
        const getValue = ([ x, y ]) => this.matrix.get(new Point(x, y))
        // TODO: is this filter necessary?
        const values = points.map(getValue).filter(n => typeof n == 'number')
        return sum(values) / values.length
    }

    _set(point, value) {
        const size = this.size
        const height = parseInt(clamp(value, -size, size), 10)
        this.matrix.set(point, height)
        this._updateMinMax(height)
    }

    _updateMinMax(height) {
        if (height > this.max) this.max = height
        if (height < this.min) this.min = height
    }

    get(point) {
        let value = this.matrix.get(point)
        return this.values.length ? this._normalize(value) : value
    }

    _normalize(height) {
        const newRange = this.values.length - 1
        const oldRange = this.max - this.min
        const index = (height - this.min) / oldRange * newRange
        return this.values[Math.floor(index)]
    }
}


export class TileableDiamondSquare extends DiamondSquare {
    _setSeedPoints() {
        const maxIndex = this.size - 1
        const value = this._getVariation()
        this._set(new Point(0, 0), value)
        this._set(new Point(maxIndex, 0), value)
        this._set(new Point(0, maxIndex), value)
        this._set(new Point(maxIndex, maxIndex), value)
    }

    _set(point, value) {
        if (this.matrix.get(point) != EMPTY) return
        if (! this._isCorner(point)) {
            let oppositeEdge = this._getOpposite(point)
            super._set(oppositeEdge, value)
        }
        super._set(point, value)
    }

    _isCorner(point) {
        let { x, y } = point
        let size = this.size - 1
        const topLeft = x == 0 && y == 0
        const bottomRight = x == size && y == size
        const topRight = x == size && y == 0
        const bottomLeft = x == 0 && y == size
        return topLeft || bottomRight || topRight || bottomLeft
    }

    _getOpposite(point) {
        let { x, y } = point
        if (point[0] === 0) x = this.size - 1
        if (point[1] === 0) y = this.size - 1
        return new Point(x, y)
    }
}
