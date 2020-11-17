import { repeat } from '/lib/function'
import { clamp } from '/lib/number'
import { Point } from '.'
import { PointSet } from './set'
import { Rect } from '/lib/number'


export class RandomPointDistribution {
    static create(count, width, height) {
        count = clamp(count, 1, width * height) // TODO: move this to types
        return repeat(count, () => Point.random(width, height))
    }
}


export class EvenPointDistribution {
    static create(count, width, height) {
        count = clamp(count, 1, width * height) // TODO: move this to types
        const points = []
        const rect = new Rect(width, height)
        const pointSet = PointSet.fromRect(rect)
        const pointsPerItem = Math.floor(rect.area / count)
        const radius = Math.floor(Math.sqrt(pointsPerItem) / 2)
        while(pointSet.size > 0 && points.length < count) {
            const center = pointSet.random()
            iterPointsInCircle(pointSet, center, radius, rect)
            points.push(center)
        }
        console.log(`count=${count}, radius=${radius}, total=${points.length}`)
        return points
    }
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