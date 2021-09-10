import { repeat } from '/lib/base/function'
import { clamp } from '/lib/base/number'
import { Rect } from '/lib/base/number'
import { RandomQueue } from '/lib/base/queue'
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
            EvenPointSampling.fillPointCircle(center, radius, point => {
                if (pointSet.has(point)) {
                    pointSet.delete(rect.wrap(point))
                }
            })
            samples.push(center)
        }
        if (samples.length === 1) {
            const point = samples[0]
            const x = point[0] + Math.round(width / 2)
            const y = point[1] + Math.round(height / 2)
            samples.push(rect.wrap([x, y]))
        }
        return samples
    }

    // Bounding circle algorithm
    // https://www.redblobgames.com/grids/circle-drawing/
    static fillPointCircle(center, radius, callback) {
        const top    = center[1] - radius
        const bottom = center[1] + radius
        for (let y = top; y <= bottom; y++) {
            const dy    = y - center[1]
            const dx    = Math.sqrt(radius * radius - dy * dy)
            const left  = Math.ceil(center[0] - dx)
            const right = Math.floor(center[0] + dx)
            for (let x = left; x <= right; x++) {
                callback([x, y])
            }
        }
    }
}


export class DiscPointSampling {
    static create(width, height, radius) {
        const k = 30
        const samples = []
        const rect = new Rect(width, height)

        while(pointSet.size > 0) {
            const center = pointSet.random()
            EvenPointSampling.fillPointCircle(center, radius, point => {
                if (pointSet.has(point)) {
                    pointSet.delete(rect.wrap(point))
                }
            })
            samples.push(center)
        }
        if (samples.length === 1) {
            const point = samples[0]
            const x = point[0] + Math.round(width / 2)
            const y = point[1] + Math.round(height / 2)
            samples.push(rect.wrap([x, y]))
        }
        return samples
    }


}


