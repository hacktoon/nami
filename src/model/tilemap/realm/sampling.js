import { Rect } from '/lib/number'
import { PointSet } from '/lib/point/set'


export class RealmPointSampling {
    static create(regionTileMap, radius) {
        const {width, height, origins} = regionTileMap
        const pointSet = new PointSet(width, height, origins)
        const rect = new Rect(regionTileMap.width, regionTileMap.height)
        const samples = []

        while(pointSet.size > 0) {
            const center = pointSet.random()
            RealmPointSampling.fillPointCircle(center, radius, point => {
                pointSet.delete(rect.wrap(point))
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

    // TODO: optimize this code to realms
    static fillPointCircle(center, radius, callback) {
        const top    = center[1] - radius
        const bottom = center[1] + radius
        const radpow = radius * radius
        for (let y = top; y <= bottom; y++) {
            const dy    = y - center[1]
            const dx    = Math.sqrt(radpow - dy * dy)
            const left  = Math.ceil(center[0] - dx)
            const right = Math.floor(center[0] + dx)
            for (let x = left; x <= right; x++) {
                callback([x, y])
            }
        }
    }
}
