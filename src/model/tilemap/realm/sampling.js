import { Rect } from '/lib/number'
import { PointSet } from '/lib/point/set'
import { IndexSet } from '/lib/set'
import { SingleFillUnit } from '/lib/floodfill/single'


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


export class RealmOrigins {
    static create(regionTileMap, radius) {
        const regions = regionTileMap.getRegions()
        const regionSet = new IndexSet(regions)
        const sampleRegions = []

        while(regionSet.size > 0) {
            const region = regionSet.getRandom()
            RealmOrigins.fillRealmCircle(regionSet, regionTileMap, radius, region)
            sampleRegions.push(region)
        }
        if (sampleRegions.length === 1) {
            // choose another random region in array
        }
        return sampleRegions.map(region => regionTileMap.getOriginById(region))
    }

    static fillRealmCircle(regionSet, regionTileMap, radius, centerRegion) {
        const model = {
            regionTileMap,
            regionSet,
            radius,
        }
        const fill = new SamplingFloodFill(centerRegion, model)
        while(fill.seeds.length > 0) {
            fill.grow()
        }
    }
}


class SamplingFloodFill extends SingleFillUnit {
    setValue(regionId, level) {
        this.model.regionSet.delete(regionId)
    }

    isEmpty(regionId) {
        const distance = this.model.regionTileMap.distanceBetween(
            this.origin,
            regionId
        )
        const insideCircle = distance <= this.model.radius
        return insideCircle && this.model.regionSet.has(regionId)
    }

    getNeighbors(regionId) {
        return this.model.regionTileMap.getSideRegions(regionId)
    }
}
