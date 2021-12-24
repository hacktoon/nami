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


export class RealmSampling {
    #points = []
    #regions = []
    #sampleMap = new Map()

    constructor(regionTileMap, radius) {
        const regions = regionTileMap.getRegions()
        this.regionTileMap = regionTileMap
        this.regionSet = new IndexSet(regions)
        this.radius = radius
        this._buildPoints()
    }

    _buildPoints() {
        const fillProps = {
            regionTileMap: this.regionTileMap,
            regionSet: this.regionSet,
            radius: this.radius,
            sampleMap: this.#sampleMap,
        }
        while(this.regionSet.size > 0) {
            const originRegion = this.regionSet.getRandom()
            const fill = new SamplingFloodFill(originRegion, fillProps)
            const originPoint = this.regionTileMap.getOriginById(originRegion)
            fill.growFull()
            this.#regions.push(originRegion)
            this.#points.push(originPoint)
        }
        if (this.#regions.length === 1) {
            // choose another random region in array
        }
    }

    getCenter(region) {
        return this.#sampleMap.get(region)
    }

    get points() {
        return this.#points
    }

    get regions() {
        return this.#regions
    }

    map(callback) {
        return this.#regions.map(callback)
    }
}


class SamplingFloodFill extends SingleFillUnit {
    setValue(regionId, level) {
        this.model.regionSet.delete(regionId)
        this.model.sampleMap.set(regionId, this.origin)
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
