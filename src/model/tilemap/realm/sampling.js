import { Rect } from '/lib/number'
import { RandomQueue } from '/lib/queue'
import { PointSet } from '/lib/point/set'
import { Point } from '/lib/point'


export class RealmOrigins {
    static create(regionTileMap, radius) {
        const regions = regionTileMap.getRegions()
        const regionQueue = new RandomQueue(regions)
        const regionSet = new Set(regions)
        const sampleRegions = []

        while(regionQueue.size > 0) {
            const region = regionQueue.pop()
            const origin = regionTileMap.getOriginById(region)

            const sideRegions = regionTileMap.getSideRegions(region)
            for (let sideRegion of sideRegions) {
                const sideOrigin = regionTileMap.getOriginById(sideRegion)
                const distance = Point.distance(origin, sideOrigin)
                if (distance <= radius) {
                    regionSet.delete(sideRegion)
                }
            }

            sampleRegions.push(region)
        }
        if (sampleRegions.length === 1) {
            // choose another random region in array
        }
        return sampleRegions.map(region => regionTileMap.getOriginById(region))
    }
}


export class OldRealmPointSampling {
    static create(regionTileMap, radius) {
        const {width, height, origins} = regionTileMap
        const pointSet = new PointSet(width, height, origins)
        const rect = new Rect(regionTileMap.width, regionTileMap.height)
        const samples = []

        while(pointSet.size > 0) {
            const center = pointSet.random()
            OldRealmPointSampling.fillPointCircle(center, radius, point => {
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
