import { RandomPointDistribution } from '/lib/point/distribution'
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
    constructor(grid, params) {
        this.origins = RandomPointDistribution.create(
            params.get('count'),
            params.get('width'),
            params.get('height')
        )
        this.regions = this.origins.map((origin, id) => new Region(id, origin))
        this.#fillRegions(grid, params)
    }

    get(id) {
        return this.regions[id]
    }

    forEach(callback) {
        return this.regions.forEach(callback)
    }

    #fillRegions(grid, params){
        const regionFill = new RegionFill(this.regions, grid, params)
        while(grid.hasEmptyPoints()) {
            this.regions.forEach(region => {
                const points = regionFill.fill(region.id)
                region.grow(points)
            })
        }
    }
}


class RegionFill {
    constructor(regions, grid, params) {
        this.regions = regions
        this.map = this.#createMap(grid, params)
    }

    fill(id) {
        return this.map.get(id).fill()
    }

    #createMap(grid, params) {
        const layerGrowth = params.get('layerGrowth')
        const growthChance = params.get('growthChance')
        const entries = this.regions.map(region => {
            const params = {region, layerGrowth, growthChance}
            const fill = this.#createOrganicFill(grid, params)
            return [region.id, fill]
        })
        return new Map(entries)
    }

    #createOrganicFill(grid, params) {
        const {region, layerGrowth, growthChance} = params
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
            layerGrowth,
            growthChance,
        })
    }
}


function createDistanceField(grid, regions) {
    //const borders = regions.map(region => region.borders)
}


