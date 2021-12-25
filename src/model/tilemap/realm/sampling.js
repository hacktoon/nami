import { IndexMap } from '/lib/map'
import { SingleFillUnit } from '/lib/floodfill/single'


export class RealmSampling {
    #points = []
    #regions = []
    #sampleMap = new Map()

    constructor(regionTileMap, radius) {
        const regions = regionTileMap.getRegions()
        this.regionTileMap = regionTileMap
        this.regionSet = new IndexMap(regions)
        this.radius = radius
        this._buildPoints()
    }

    _buildPoints() {
        const baseFillProps = {
            regionTileMap: this.regionTileMap,
            regionSet: this.regionSet,
            radius: this.radius,
            sampleMap: this.#sampleMap,
        }
        while(this.regionSet.size > 0) {
            // a set to check own filled regions for each instance
            const fillProps = {filledRegions: new Set(), ...baseFillProps}
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
        this.model.filledRegions.add(regionId)
        this.model.sampleMap.set(regionId, this.origin)
    }

    isEmpty(regionId) {
        const distance = this.model.regionTileMap.distanceBetween(
            this.origin,
            regionId
        )
        const insideCircle = distance <= this.model.radius
        return insideCircle && !this.model.filledRegions.has(regionId)
    }

    getNeighbors(regionId) {
        return this.model.regionTileMap.getSideRegions(regionId)
    }
}
