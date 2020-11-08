import { repeat } from '/lib/function'
import { clamp } from '/lib/number'
import { Point } from '.'
import { PointSet } from './set'


export class RandomPointDistribution {
    static create(count, width, height) {
        count = clamp(count, 1, width * height)
        return repeat(count, () => Point.random(width, height))
    }
}


export class EvenPointDistribution {
    static create(count, width, height, radius=1) {
        count = clamp(count, 1, width * height)
        const points = []
        const pointSet = createPointSet(width, height)
        while(pointSet.size > 0 && points.length < count) {
            const point = pointSet.random()
            // get points in circle

            points.push(point)
        }
        return points
    }
}
window.EvenPointDistribution = EvenPointDistribution

function createPointSet(width, height) {
    const pointSet = new PointSet()
    for(let i=0; i<width; i++) {
        for(let j=0; j<height; j++) {
            pointSet.add(new Point(i, j))
        }
    }
    return pointSet
}


function removePointsInCircle(point, pointSet, radius) {
    const {x, y} = point
    pointSet.delete(point)
    for(let i=x-radius; i<x+radius; i++) {
        for(let j=y-radius; j<y+radius; j++) {
            pointSet.delete(new Point(i, j))
        }
    }
    return pointSet
}