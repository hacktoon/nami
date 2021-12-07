import { Rect } from '/lib/number'
import { RandomQueue } from '/lib/queue'


export class RealmPointSampling {
    static create(regionTileMap, radius) {
        const {width, height} = regionTileMap
        const regionQueue = new RandomQueue(regionTileMap.getRegions())
        const rect = new Rect(regionTileMap.width, regionTileMap.height)
        const sampleRegions = []

        while(regionQueue.size > 0) {
            const centerRegion = regionQueue.pop()
            sampleRegions.push(centerRegion)
            RealmPointSampling.fillRegionCircle(
                centerRegion,
                radius,
                region => pointSet.delete(region)
            )
        }
        if (sampleRegions.length === 1) {
            const point = sampleRegions[0]
            const x = point[0] + Math.round(width / 2)
            const y = point[1] + Math.round(height / 2)
            sampleRegions.push(rect.wrap([x, y]))
        }
        return sampleRegions
    }

    // TODO: optimize this code to realms
    static fillRegionCircle(center, radius, callback) {
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
