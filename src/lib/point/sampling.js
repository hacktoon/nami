import { Point } from '/src/lib/point'
import { PointArraySet } from '/src/lib/point/set'


export class EvenPointSampling {
    static create(rect, radius) {
        const samples = []
        const pointSet = new PointArraySet(rect)

        while(pointSet.size > 0) {
            const center = pointSet.random()
            Point.insideCircle(center, radius, point => {
                pointSet.delete(rect.wrap(point))
            })
            samples.push(center)
        }
        if (samples.length === 1) {
            const point = samples[0]
            const x = point[0] + Math.round(rect.width / 2)
            const y = point[1] + Math.round(rect.height / 2)
            samples.push(rect.wrap([x, y]))
        }
        return samples
    }
}