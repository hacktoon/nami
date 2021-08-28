import { Point } from '/lib/base/point'
import { Rect } from '/lib/base/number'


export class Matrix {
    constructor(width, height, buildValue=()=>null) {
        this.width = width
        this.height = height
        this.area = width * height
        this.rect = new Rect(width, height)
        this.matrix = []

        for (let y = 0; y < this.height; y++) {
            this.matrix.push([])
            for (let x = 0; x < this.width; x++) {
                const value = buildValue([x, y])
                this.matrix[y].push(value)
            }
        }
    }

    get(point) {
        let [x, y] = this.wrap(point)
        return this.matrix[y][x]
    }

    set(point, value) {
        let [x, y] = this.wrap(point)
        this.matrix[y][x] = value
    }

    wrap(point) {
        return this.rect.wrap(point)
    }

    wrapVector(sourcePoint, targetPoint) {
        // return wrapped targetPoint in relation to sourcePoint
        const [sX, sY] = sourcePoint
        const [tX, tY] = targetPoint
        let [x, y] = [tX, tY]
        const deltaX = Math.abs(sX - tX)
        const deltaY = Math.abs(sY - tY)
        if (deltaX > this.width / 2) {
            if (sX < tX) x -= this.width
            if (sX > tX) x += this.width
        }
        if (deltaY > this.height / 2) {
            if (sY < tY) y -= this.height
            if (sY > tY) y += this.height
        }
        return [x, y]
    }

    isWrappable(point) {
        return ! this.rect.isInside(point)
    }

    forEach(callback) {

    }
}
