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


export class RegionFill {
    constructor(regionMap, params) {
        this.regionSet = regionMap.regionSet
        this.map = this.#createMap(regionMap.grid, params)
    }

    fill(id) {
        return this.map.get(id).fill()
    }

    #createMap(grid, params) {
        const entries = this.regionSet.map(region => {
            const fill = this.#createOrganicFill(region, grid, params)
            return [region.id, fill]
        })
        return new Map(entries)
    }

    #createOrganicFill(region, grid, params) {
        return new OrganicFill(region.origin, {
            setBorder:  (point, neighbor) => {
                grid.setBorder(point)
                region.setBorder(point, neighbor)
            },
            setOrigin:  point => grid.setOrigin(point),
            setSeed:    point => grid.setSeed(point, region.id),
            setValue:   point => grid.setValue(point, region.id),
            setLayer:   (point, layer) => grid.setLayer(point, layer),
            isEmpty:    point => grid.isEmpty(point),
            isSeed:     point => grid.isSeed(point, region.id),
            isBlocked:  point => grid.isBlocked(point, region.id),
            layerGrowth: params.get('layerGrowth'),
            growthChance: params.get('growthChance'),
        })
    }
}


function createDistanceField(grid, regions) {
    //const borders = regions.map(region => region.borders)
}


