
export class Rect {
    static fromHash(hash) {
        const [w, h] = hash.split('x').map(c => parseInt(c, 10))
        return new Rect(w, h)
    }

    static multiply(rect, factor) {
        return new Rect(rect.width * factor, rect.height * factor)
    }

    constructor(width=1, height) {
        this.width = width
        this.height = height ?? width
    }

    get area() {
        return this.width * this.height
    }

    hash() {
        return `${this.width}x${this.height}`
    }

    pointToIndex([x, y]) {
        // https://en.wikipedia.org/wiki/Row-_and_column-major_order
        return x + this.width * y
    }

    indexToPoint(index) {
        const y = Math.floor(index / this.width)
        const x = index % this.width
        return [x, y]
    }

    isInside(point) {
        const x = point[0] >= 0 && point[0] < this.width
        const y = point[1] >= 0 && point[1] < this.height
        return x && y
    }

    isEdge([x, y]) {
        const _x = x === 0 || x === this.width - 1
        const _y = y === 0 || y === this.height - 1
        return _x || _y
    }

    isCorner([x, y]) {
        const _x = x === 0 || x === this.width - 1
        const _y = y === 0 || y === this.height - 1
        return _x && _y
    }

    isEdgeMiddle([x, y]) {
        const middleWidth = Math.floor(this.width / 2);
        const middleHeight = Math.floor(this.height / 2);
        const _x = (x === 0 || x === this.width - 1) && y === middleHeight
        const _y = (y === 0 || y === this.height - 1) && x === middleWidth
        return _x || _y
    }

    wrap(point) {
        let [x, y] = point
        if (x >= this.width) { x %= this.width }
        if (y >= this.height) { y %= this.height }
        if (x < 0) { x = this.width - 1 - Math.abs(x + 1) % this.width }
        if (y < 0) { y = this.height - 1 - Math.abs(y + 1) % this.height }
        return [x, y]
    }

    unwrapFrom(sourcePoint, targetPoint) {
        // return wrapped targetPoint in relation to sourcePoint
        const [sX, sY] = sourcePoint
        const [tX, tY] = targetPoint
        let [x, y] = targetPoint
        const deltaX = Math.abs(sX - tX)
        const deltaY = Math.abs(sY - tY)
        if (deltaX > this.width / 2) {
            if (sX < tX) x = x - this.width
            if (sX > tX) x = x + this.width
        }
        if (deltaY > this.height / 2) {
            if (sY < tY) y = y - this.height
            if (sY > tY) y = y + this.height
        }
        return [x, y]
    }
}