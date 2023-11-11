
export const interpolateNumbers = (from, to, totalItems) => {
    var totalNumbers = to - from + 1,
        stepValue = totalNumbers / totalItems,
        numbers = [from],
        currentValue = from

    for(let i=0; i<totalItems - 2; i++) {
        currentValue += stepValue
        numbers.push(Math.round(currentValue))
    }
    numbers.push(to)
    return numbers
}


export const clamp = (value, min, max) => Math.max(min, Math.min(value, max))

export const sum = arr => arr.reduce((a,b) => a + b, 0)


export class Rect {
    static fromHash(hash) {
        const [w, h] = hash.split('x').map(c => parseInt(c, 10))
        return new Rect(w, h)
    }

    static multiply(rect, factor) {
        return new Rect(rect.width * factor, rect.height * factor)
    }

    constructor(width, height) {
        this.width = width
        this.height = height ?? width
    }

    get area() {
        return this.width * this.height
    }

    isInside(point) {
        const x = point[0] >= 0 && point[0] < this.width
        const y = point[1] >= 0 && point[1] < this.height
        return x && y
    }

    inEdge(point) {
        const x = point[0] === 0 || point[0] === this.width - 1
        const y = point[1] === 0 || point[1] === this.height - 1
        return x || y
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

    hash() {
        return `${this.width}x${this.height}`
    }
}