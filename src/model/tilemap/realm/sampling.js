import { Rect } from '/lib/number'
import { PointSet } from '/lib/point/set'
import { IndexSet } from '/lib/set'
import { Point } from '/lib/point'


export class RealmOrigins {
    static create(regionTileMap, radius) {
        const regions = regionTileMap.getRegions()
        const regionSet = new IndexSet(regions)
        const rect = new Rect(regionTileMap.width, regionTileMap.height)
        const sampleRegions = []

        while(regionSet.size > 0) {
            const region = regionSet.getRandom()
            const origin = regionTileMap.getOriginById(region)
            let next = [region]
            regionSet.delete(region)
            fillRealmCircle(regionTileMap, radius, origin)
            sampleRegions.push(region)
        }
        if (sampleRegions.length === 1) {
            // choose another random region in array
        }
        return sampleRegions.map(region => regionTileMap.getOriginById(region))
    }

    static fillRealmCircle(regionTileMap, radius, origin) {
        while(next.length > 0) {
            const sideRegions = regionTileMap.getSideRegions(region)
            for (let sideRegion of sideRegions) {
                const rectSideOrigin = regionTileMap.getOriginById(sideRegion)
                const sideOrigin = rect.unwrapNearest(origin, rectSideOrigin)
                const distance = Point.distance(origin, sideOrigin)
                if (distance <= radius) {
                    regionSet.delete(sideRegion)
                }
            }
        }
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
