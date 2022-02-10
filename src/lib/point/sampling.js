import { IndexedPointSet } from './set'


export class EvenPointSampling {
    static create(rect, radius) {
        const samples = []
        const ptIndexMap = IndexedPointSet.fromRect(rect)

        while(ptIndexMap.size > 0) {
            const center = ptIndexMap.random()
            EvenPointSampling.fillPointCircle(center, radius, point => {
                ptIndexMap.delete(rect.wrap(point))
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
