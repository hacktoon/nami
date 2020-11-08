import { repeat } from '/lib/function'
import { clamp } from '/lib/number'
import { Point } from '.'
import { PointSet } from './set'
import { Rect } from '/lib/number'


export class RandomPointDistribution {
    static create(count, width, height) {
        count = clamp(count, 1, width * height)
        return repeat(count, () => Point.random(width, height))
    }
}


export class EvenPointDistribution {
    static create(count, width, height) {
        count = clamp(count, 1, width * height)
        const points = []
        const pointSet = createPointSet(width, height)
        const rect = new Rect(width, height)
        const radiusX = Math.ceil(width / count)
        const radiusY = Math.ceil(height / count)
        const radius = radiusX * radiusY * 2
        while(pointSet.size > 0 && points.length < count) {
            const center = pointSet.random()
            iterPointsInCircle(pointSet, center, radius, rect)
            points.push(center)
        }
        return points
    }
}


function createPointSet(width, height) {
    const pointSet = new PointSet()
    for(let i=0; i<width; i++) {
        for(let j=0; j<height; j++) {
            pointSet.add(new Point(i, j))
        }
    }
    return pointSet
}


function iterPointsInCircle(pointSet, center, radius, rect) {
    const {x, y} = center
    for(let i=x-radius; i<x+radius; i++) {
        for(let j=y-radius; j<y+radius; j++) {
            const point = rect.wrap(new Point(i, j))
            if (point.distance(center) <= radius) {
                pointSet.delete(point)
            }
        }
    }
}