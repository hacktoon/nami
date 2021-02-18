import { repeat } from '/lib/base/function'
import { clamp } from '/lib/base/number'
import { Point } from '.'
import { PointSet } from './set'
import { Rect } from '/lib/base/number'


export class RandomPointSampling {
    static label = 'Random'

    static create(count, width, height) {
        const parsedMaxCount = clamp(count, 1, width * height)
        return repeat(parsedMaxCount, () => Point.random(width, height))
    }
}


export class EvenPointSampling {
    static label = 'Even'

    static create(radius, width, height) {
        const points = []
        const rect = new Rect(width, height)
        const pointSet = PointSet.fromRect(rect)
        const maskPoints = circleMaskPoints(radius)

        while(pointSet.size > 0) {
            const center = pointSet.random()
            deletePointsInCircle(maskPoints, pointSet, center, rect)
            points.push(center)
        }
        return points
    }
}


function circleMaskPoints(radius) {
    const center = new Point(0, 0)
    const points = []
    for(let i = center.x - radius; i < center.x + radius; i++) {
        for(let j = center.y - radius; j < center.y + radius; j++) {
            const point = new Point(i, j)
            if (point.distance(center) <= radius) {
                points.push(point)
            }
        }
    }
    return points
}


function deletePointsInCircle(maskPoints, pointSet, center, rect) {
    maskPoints.forEach(maskPoint => {
        const point = rect.wrap(center.plus(maskPoint))
        pointSet.delete(point)
    })
}