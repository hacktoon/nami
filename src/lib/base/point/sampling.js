import { repeat } from '/lib/base/function'
import { clamp } from '/lib/base/number'
import { Rect } from '/lib/base/number'
import { Random } from '/lib/base/random'
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
            const point = samples[0]
            const x = point[0] + Math.round(width / 2)
            const y = point[1] + Math.round(height / 2)
            samples.push(rect.wrap([x, y]))
        }
        return samples
    }
}

export class SquarePointSampling {
    static create(width, height, size) {
        const samples = []
        const half = Math.floor(size / 2)
        const rect = new Rect(width, height)
        const xCount = Math.floor(width / size)
        const yCount = Math.floor(height / size)
        const xHalf = Math.floor(xCount / 2)
        const yHalf = Math.floor(yCount / 2)
        let x = 0, y = 0
        for(let j = 0; j < yCount; j++) {
            y = size * j + (x % 2 ? half : 0)
            for(let i = 0; i < xCount; i++) {
                x = size * i + (y % 2 ? half : 0)
                let dx = Random.int(half)
                let dy = Random.int(half)
                samples.push([x + dx, y + dy])
            }
        }
        // if (samples.length === 1) {
        //     const point = samples[0]
        //     const x = point[0] + Math.round(width / 2)
        //     const y = point[1] + Math.round(height / 2)
        //     samples.push(rect.wrap([x, y]))
        // }
        return samples
    }
}


// Bounding circle algorithm
// https://www.redblobgames.com/grids/circle-drawing/
function fillPointCircle(center, radius, callback) {
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
