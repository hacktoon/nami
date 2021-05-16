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
        this.regionToGroup = new RedirectRegionToGroupMap(data)
        this.regionTileMap = data.regionTileMap
        this.regionNeighborsMap = data.regionNeighborsMap
        this.groups = data.groups
        this.graph = data.graph
    }

    _build(seed, params) {
        const [width, height] = params.get('width', 'height')
        const groupScale = params.get('groupScale')
        const data = {
            groupChance: params.get('groupChance'),
            groupGrowth: params.get('groupGrowth'),
            regionToGroup: new Map(),
            regionNeighborsMap: new RegionNeighborsMap(),
            redirects: new Map(),
            graph: new Graph(),
            groups: new Map(),
            regionTileMap: this._buildRegionTileMap(seed, params),
        }
        const origins = EvenPointSampling.create(width, height, groupScale)
        const fills = origins.map((origin, id) => {
            const region = data.regionTileMap.getRegion(origin)
            const fillConfig = new RegionGroupFillConfig(id, data)
            return new OrganicFloodFill(region, fillConfig)
        })

        new MultiFill(fills).forEach(fill => {
            const group = new RegionGroup(fill.config.id, fill.origin, fill.count)
            const neighborIds = data.graph.getEdges(fill.config.id)
            if (neighborIds.length === 1 || fill.count == 1) {
                data.graph.deleteNode(group.id)
                data.redirects.set(group.id, neighborIds[0])
                // return
            }
            data.groups.set(group.id, group)
        })

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


export class RedirectRegionToGroupMap {
    constructor(data) {
        this.data = data
    }

    get(region) {
        const redirects = this.data.redirects
        const id = this.data.regionToGroup.get(region)
        return redirects.has(id) ? redirects.get(id) : id
    }
}


export class RedirectBorderRegionMap {
    constructor(data) {
        this.data = data
    }

    get(region) {
        // TODO: get which region I'm neighbor of
        const redirects = this.data.redirects
        const neighId = this.data.regionNeighborsMap.get(region.id)
        return redirects.has(neighId) ? redirects.get(neighId) : neighId
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


class RegionNeighborsMap {
    constructor() {
        this.map = new Map()
    }

    set(regionId, neighborId) {
        if (! this.map.has(regionId)) {
            this.map.set(regionId, new Set())
        }
        this.map.get(regionId).add(neighborId)
    }

    get(id) {
        return this.map.get(id)
    }

    keys() {
        return Array.from(this.map.keys())
    }

    has(id) {
        return this.map.has(id)
    }
}