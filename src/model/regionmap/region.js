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
    constructor(regionMap, params) {
        this.regionMap = regionMap
        this.fillMap = this.#createFillMap(params)
        this.#fillRegions()
    }

    fill(id) {
        return this.fillMap.get(id).fill()
    }

    #createFillMap(params) {
        const entries = this.regionMap.regionSet.map(region => {
            const fill = this.#createOrganicFill(region, params)
            return [region.id, fill]
        })
        return new Map(entries)
    }

    #createOrganicFill(region, params) {
        const map = this.regionMap
        return new OrganicFill(region.origin, {
            setBorder:  (point, neighbor) => {
                map.setBorder(point)
                region.setBorder(point, neighbor)
            },
            setOrigin:  point => map.setOrigin(point),
            setSeed:    point => map.setSeed(point, region.id),
            setValue:   point => map.setValue(point, region.id),
            setLayer:   (point, layer) => map.setLayer(point, layer),
            isEmpty:    point => map.isEmpty(point),
            isSeed:     point => map.isSeed(point, region.id),
            isBlocked:  point => map.isBlocked(point, region.id),
            layerGrowth: params.get('layerGrowth'),
            growthChance: params.get('growthChance'),
        })
    }

    #fillRegions(){
        let totalPoints = this.regionMap.area
        while(totalPoints > 0) {
            this.regionMap.regionSet.forEach(region => {
                const points = this.fill(region.id)
                region.grow(points)
                totalPoints -= points.length
            })
        }
    }

}


function createDistanceField(grid, regions) {
    //const borders = regions.map(region => region.borders)
}

