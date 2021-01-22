import { PointSet } from '/lib/point/set'
import { OrganicFill } from '/lib/flood-fill'


const EMPTY_VALUE = null
const EMPTY_SEED = null
const TYPE_NORMAL = 1
const TYPE_BORDER = 2


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


export class RegionMapFill {
    constructor(regionMap, params) {
        this.regionMap = regionMap
        this.map = this.#createMap(params)
        this.#fillRegions()
    }

    fill(id) {
        return this.map.get(id).fill()
    }

    #createMap(params) {
        const entries = this.regionMap.regionSet.map(region => {
            const fill = this.#createOrganicFill(region, params)
            return [region.id, fill]
        })
        return new Map(entries)
    }

    #createOrganicFill(region, params) {
        const map = this.regionMap
        const grid = this.regionMap.grid
        return new OrganicFill(region.origin, {
            setBorder:  (point, neighbor) => {
                grid.setBorder(point)
                region.setBorder(point, neighbor)
            },
            setOrigin:  point => map.setOrigin(point),
            setSeed:    point => map.setSeed(point, region.id),
            setValue:   point => grid.setValue(point, region.id),
            setLayer:   (point, layer) => grid.setLayer(point, layer),
            isEmpty:    point => grid.isEmpty(point),
            isSeed:     point => grid.isSeed(point, region.id),
            isBlocked:  point => grid.isBlocked(point, region.id),
            layerGrowth: params.get('layerGrowth'),
            growthChance: params.get('growthChance'),
        })
    }

    #fillRegions(){
        while(this.regionMap.grid.hasEmptyPoints()) {
            this.regionMap.regionSet.forEach(region => {
                const points = this.fill(region.id)
                region.grow(points)
            })
        }
    }

}


function createDistanceField(grid, regions) {
    //const borders = regions.map(region => region.borders)
}


export class RegionCell {
    #isOrigin = false
    #type     = TYPE_NORMAL

    constructor() {
        this.layer    = 0
        this.value    = EMPTY_VALUE
        this.seed     = EMPTY_SEED
        this.neighbor = null
    }

    isOrigin() {
        return this.#isOrigin
    }

    isBorder() {
        return this.#type === TYPE_BORDER
    }

    isLayer(layer) {
        return this.layer === layer
    }

    isValue(value) {
        return this.value === value
    }

    isEmpty() {
        return this.isValue(EMPTY_VALUE)
    }

    isSeed(value) {
        return this.seed === value
    }

    isEmptySeed() {
        return this.seed === EMPTY_SEED
    }

    setOrigin() {
        this.#isOrigin = true
    }

    setBorder() {
        return this.#type = TYPE_BORDER
    }

    setSeed(value) {
        return this.seed = value
    }
}