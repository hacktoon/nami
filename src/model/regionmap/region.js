import { PointSet } from '/lib/point/set'
import { OrganicFill } from '/lib/flood-fill'


export class Region {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
        this.points = new PointSet(origin)
        this.borders = new PointSet()
    }

    get size() {
        return this.points.size
    }

    has(point) {
        return this.points.has(point)
    }

    setBorder(point, neighbor) {
        // if (this.id == 1) {
        //     console.log(neighbor);
        // }
        this.borders.add(point)
    }

    grow(points) {
        this.points.add(...points)
        return points.length
    }
}


export class RegionSet {
    constructor(origins) {
        this.origins = origins
        this.regions = this.origins.map((origin, id) => new Region(id, origin))
    }

    get(id) {
        return this.regions[id]
    }

    forEach(callback) {
        return this.regions.forEach(callback)
    }

    map(callback) {
        return this.regions.map(callback)
    }
}


export class RegionMapFill {
    constructor(regionMap) {
        this.regionMap = regionMap
        this.fillMap = this.#createFillMap()
        this.#fillRegions()
    }

    fill(id) {
        return this.fillMap.get(id).fill()
    }

    #createFillMap() {
        const entries = this.regionMap.regionSet.map(region => {
            const fill = this.#createOrganicFill(region)
            return [region.id, fill]
        })
        return new Map(entries)
    }

    #createOrganicFill(region) {
        const map = this.regionMap
        return new OrganicFill(region.origin, {
            setBorder: (point, neighbor) => {
                map.at(point).setBorder()
                region.setBorder(point, neighbor)
            },
            setOrigin:  point => map.at(point).setOrigin(),
            setSeed:    point => map.at(point).setSeed(region.id),
            setValue:   point => map.at(point).setValue(region.id),
            setLayer:   (point, layer) => map.at(point).setLayer(layer),
            isEmpty:    point => map.at(point).isEmpty(),
            isSeed:     point => map.at(point).isSeed(region.id),
            isBlocked:  point => map.isBlocked(point, region.id),
            layerGrowth: map.layerGrowth,
            growthChance: map.growthChance
        })
    }

    #fillRegions(){
        let totalPoints = this.regionMap.area
        while(totalPoints > 0) {
            this.regionMap.regionSet.forEach(region => {
                const points = this.fill(region.id)
                totalPoints -= region.grow(points)
            })
        }
    }

}


function createDistanceField(grid, regions) {
    //const borders = regions.map(region => region.borders)
}

