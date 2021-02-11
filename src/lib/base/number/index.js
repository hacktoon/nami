import { Point } from '/lib/point'


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
    constructor(width, height) {
        this.width = width
        this.height = height ?? width
    }

    get area() {
        return this.width * this.height
    }

    inside(point) {
        const x = point.x >= 0 && point.x < this.width
        const y = point.y >= 0 && point.y < this.height
        return x && y
    }

    wrap(point) {
        let {x, y} = point
        if (x >= this.width) { x %= this.width }
        if (y >= this.height) { y %= this.height }
        if (x < 0) { x = this.width - 1 - Math.abs(x + 1) % this.width }
        if (y < 0) { y = this.height - 1 - Math.abs(y + 1) % this.height }
        return new Point(x, y)
    }
}