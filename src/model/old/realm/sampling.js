import { IndexMap } from '/src/lib/map'
import { SingleFillUnit } from '/src/lib/floodfill/single'


export class RealmSampling {
    #points = []
    #regions = []
    #sampleMap = new Map()

    constructor(regionTileMap, radius) {
        const regions = regionTileMap.getRegions()
        this.regionTileMap = regionTileMap
        this.regionIndexMap = new IndexMap(regions)
        this.radius = radius
        this._buildPoints()
    }

    _buildPoints() {
        const baseFillProps = {
            regionTileMap: this.regionTileMap,
            regionIndexMap: this.regionIndexMap,
            radius: this.radius,
            sampleMap: this.#sampleMap,
        }
        while(this.regionIndexMap.size > 0) {
            // a set to check own filled regions for each instance
            const fillProps = {filledRegions: new Set(), ...baseFillProps}
            const originRegion = this.regionIndexMap.random()
            const fill = new RealmFloodFill(originRegion, fillProps)
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


class RealmFloodFill extends SingleFillUnit {
    setValue(regionId, level) {
        this.context.regionIndexMap.delete(regionId)
        this.context.filledRegions.add(regionId)
        this.context.sampleMap.set(regionId, this.origin)
    }

    isEmpty(regionId) {
        const regionTileMap = this.context.regionTileMap
        const distance = regionTileMap.distanceBetween(this.origin, regionId)
        const insideCircle = distance <= this.context.radius
        return insideCircle && !this.context.filledRegions.has(regionId)
    }

    getNeighbors(regionId) {
        return this.context.regionTileMap.getSideRegions(regionId)
    }
}
