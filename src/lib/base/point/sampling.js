import { repeat } from '/lib/base/function'
import { clamp } from '/lib/base/number'
import { Rect } from '/lib/base/number'
import { PointSet } from './set'
import { Point } from '.'


export class RandomPointSampling {
    static id = 'RandomPointSampling'

    static create(width, height, count) {
        const parsedMaxCount = clamp(count, 1, width * height)
        return repeat(parsedMaxCount, () => Point.random(width, height))
    }
}


export class EvenPointSampling {
    static id = 'EvenPointSampling'

    static create(width, height, radius) {
        const samples = []
        const rect = new Rect(width, height)
        const pointSet = new PointSet(width, height)

        while(pointSet.size > 0) {
            const center = pointSet.random()
            fillPointCircle(center, radius, point => {
                if (pointSet.has(point)) {
                    pointSet.delete(rect.wrap(point))
                }
            })
            samples.push(center)
        }
        if (samples.length === 1) {
            const x = samples[0].x + Math.round(width / 2)
            const y = samples[0].y + Math.round(height / 2)
            const point = rect.wrap(new Point(x, y))
            samples.push(point)
        }
        return samples
    }
}


// Bounding circle algorithm
// https://www.redblobgames.com/grids/circle-drawing/
function fillPointCircle(center, radius, callback) {
    const top    = center.y - radius
    const bottom = center.y + radius
    for (let y = top; y <= bottom; y++) {
        const dy    = y - center.y
        const dx    = Math.sqrt(radius * radius - dy * dy)
        const left  = Math.ceil(center.x - dx)
        const right = Math.floor(center.x + dx)
        for (let x = left; x <= right; x++) {
            callback(new Point(x, y))
        }
    }
}
