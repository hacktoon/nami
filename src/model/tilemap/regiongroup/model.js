import { Color } from '/lib/base/color'
import { MultiFill } from '/lib/floodfill'
import { Graph } from '/lib/base/graph'
import { EvenPointSampling } from '/lib/base/point/sampling'
import { OrganicFloodFill } from '/lib/floodfill/organic'

import { RegionTileMap } from '/model/tilemap/region'


class RegionGroup {
    constructor(id, region, count) {
        this.id = id
        this.origin = region.origin
        this.color = new Color()
        this.count = count
    }
}


export class RegionGroupModel {
    constructor(seed, params) {
        const data = this._build(seed, params)
        this.regionNeighborsMap = new RegionNeighborsMap(data)
        this.regionToGroup = new RegionToGroupMap(data)
        this.regionTileMap = data.regionTileMap
        this.groups = data.groups
        this.graph = data.graph
    }

    _build(seed, params) {
        const [width, height] = params.get('width', 'height')
        const groupScale = params.get('groupScale')
        const data = {
            regionTileMap: this._buildRegionTileMap(seed, params),
            groupChance: params.get('groupChance'),
            groupGrowth: params.get('groupGrowth'),
            regionNeighborsMap: new SetMap(),
            regionToGroup: new Map(),
            redirects: new Map(),
            graph: new Graph(),
            groups: new Map(),
        }
        const origins = EvenPointSampling.create(width, height, groupScale)
        const fills = origins.map((origin, id) => {
            const region = data.regionTileMap.getRegion(origin)
            const fillConfig = new RegionGroupFillConfig(id, data)
            return new OrganicFloodFill(region, fillConfig)
        })

        new MultiFill(fills).forEach(fill => {
            const group = new RegionGroup(fill.config.id, fill.origin, fill.count)
            const neighborGroupIds = data.graph.getEdges(group.id)
            if (neighborGroupIds.length === 1 || group.count == 1) {
                data.graph.deleteNode(group.id)
                data.redirects.set(group.id, neighborGroupIds[0])
                // return
            }
            data.groups.set(group.id, group)
        })
        console.log(data.redirects);
        return data
    }

    _buildRegionTileMap(seed, params) {
        const [width, height] = params.get('width', 'height')
        const [scale, chance, growth] = params.get('scale', 'chance', 'growth')
        const data = {width, height, scale, seed, chance, growth}
        return RegionTileMap.fromData(data)
    }

    map(callback) {
        const groups = Array.from(this.groups.values())
        return groups.map(callback)
    }

    forEach(callback) {
        this.groups.forEach(callback)
    }
}


export class RegionToGroupMap {
    constructor(data) {
        this.data = data
    }

    get(region) {
        const redirects = this.data.redirects
        const id = this.data.regionToGroup.get(region)
        return redirects.has(id) ? redirects.get(id) : id
    }
}


export class RegionNeighborsMap {
    /*
        This class overrides the default region neighbor SetMap.
        It redirects overriden regions to its containing group neighbor region
    */
    constructor(data) {
        this.data = data
    }

    // keys() {

    // }

    has(id) {
        // has neighbors (filter redirects)
        const redirects = this.data.redirects
        const neighborIds = this.data.regionNeighborsMap.get(id)
        // const redirId = redirects.has(id) ? redirects.get(id) : id
        // for(let neighborId of neighborIds.values()) {

        // }

        return this.data.regionNeighborsMap.has(id)
    }
}


class RegionGroupFillConfig {
    constructor(id, model) {
        this.id = id
        this.model = model
        this.chance = model.groupChance
        this.growth = model.groupGrowth
    }

    isEmpty(region) {
        return !this.model.regionToGroup.has(region.id)
    }

    setValue(region) {
        this.model.regionToGroup.set(region.id, this.id)
    }

    checkNeighbor(neighborRegion, region) {
        if (this.isEmpty(neighborRegion)) return
        const neighborGroupId = this.model.regionToGroup.get(neighborRegion.id)
        if (neighborGroupId === this.id) return
        this.model.regionNeighborsMap.set(region.id, neighborRegion.id)
        this.model.graph.setEdge(this.id, neighborGroupId)
    }

    getNeighbors(region) {
        return this.model.regionTileMap.getNeighborRegions(region)
    }
}


class SetMap {
    /*
        This class maps a value to a Set
    */
    constructor() {
        this.map = new Map()
    }

    set(keyId, valueId) {
        if (! this.map.has(keyId)) {
            this.map.set(keyId, new Set())
        }
        this.map.get(keyId).add(valueId)
    }

    get(id) {
        if (this.map.has(id)) {
            return this.map.get(id)
        }
        return new Set()
    }

    keys() {
        return this.map.keys()
    }

    has(id) {
        return this.map.has(id)
    }
}