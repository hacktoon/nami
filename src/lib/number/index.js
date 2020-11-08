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
    static wrap(point, width, height) {
        let {x, y} = point
        if (x >= width) { x %= width }
        if (y >= height) { y %= height }
        if (x < 0) { x = width - 1 - Math.abs(x + 1) % width }
        if (y < 0) { y = height - 1 - Math.abs(y + 1) % height }
        return new Point(x, y)
    }
}