import { PairMap } from '/lib/map'
import { Direction } from '/lib/direction'
import { Point } from '/lib/point'
import { Graph } from '/lib/graph'
import { EvenPointSampling } from '/lib/point/sampling'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'

import { RegionTileMap } from '/model/tilemap/region'

import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'

import { RegionGroupTileMapDiagram } from './diagram'
import { RegionGroupMultiFill } from './fill'


const ID = 'RegionGroupTileMap'
const SCHEMA = new Schema(
    ID,
    Type.number('width', 'W', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'H', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('groupScale', 'Gr Scale', {default: 34, step: 1, min: 1, max: 100}),
    Type.number('groupChance', 'Gr Chance', {default: 0.1, step: 0.1, min: 0.1, max: 1}),
    Type.number('groupGrowth', 'Gr Growth', {default: 25, step: 1, min: 0, max: 100}),
    Type.number('scale', 'Rg scale', {default: 2, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Rg growth', {default: 0, step: 1, min: 0, max: 100}),
    Type.number('chance', 'Rg chance', {default: 0.1, step: 0.1, min: 0.1, max: 1}),
    Type.text('seed', 'Seed', {default: ''})
)


export class RegionGroupTileMap extends TileMap {
    static id = ID
    static diagram = RegionGroupTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static fromData(data) {
        const map = new Map(Object.entries(data))
        const params = RegionGroupTileMap.schema.buildFrom(map)
        return new RegionGroupTileMap(params)
    }

    static create(params) {
        return new RegionGroupTileMap(params)
    }

    constructor(params) {
        super(params)
        const groupScale = params.get('groupScale')
        const [width, height, seed] = params.get('width', 'height', 'seed')
        const origins = EvenPointSampling.create(width, height, groupScale)
        this.borderRegions = new Set()
        this.regionToGroup = new Map()
        this.graph = new Graph()
        this.groupChance = params.get('groupChance')
        this.groupGrowth = params.get('groupGrowth')
        this.regionTileMap = this._buildRegionTileMap(seed, params)
        this.groups = this._buildGroups(origins)
        this.directions = this._buildDirections(this.groups)
    }

    _buildRegionTileMap(seed, params) {
        const [width, height] = params.get('width', 'height')
        const [scale, chance, growth] = params.get('scale', 'chance', 'growth')
        const data = {width, height, scale, seed, chance, growth}
        return RegionTileMap.fromData(data)
    }

    _buildGroups(origins) {
        const groups = []
        const fills = origins.map((origin, id) => {
            const region = this.regionTileMap.getRegion(origin)
            const fillConfig = new RegionGroupFillConfig(id, this)
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(fills).map(fill => {
            const group = new RegionGroup(
                fill.config.id, fill.origin, fill.config.area
            )
            groups.push(group)
        })
        return groups
    }

    _buildDirections(groups) {
        const directions = new PairMap()
        const matrix = this.regionTileMap.regionMatrix
        for(let group of groups) {
            this.graph.getEdges(group.id).forEach(neighborId => {
                const neighbor = groups[neighborId]
                const sideOrigin = matrix.wrapVector(group.origin, neighbor.origin)
                const angle = Point.angle(group.origin, sideOrigin)
                const direction = Direction.fromAngle(angle)
                directions.set(group.id, neighborId, direction)
            })
        }
        return directions
    }

    get(point) {
        const region = this.getRegion(point)
        const group = this.getGroup(point)
        const neighbors = this.getNeighborGroups(group)
        return {
            group: group.id,
            region: region.id,
            neighbors: neighbors.map(neighbor => {
                const dir = this.getGroupDirection(group, neighbor)
                return `${dir.name}(${neighbor.id})`
            }).join(', ')
        }
    }

    getRegion(point) {
        return this.regionTileMap.getRegion(point)
    }

    getRegions() {
        return this.regionTileMap.getRegions()
    }

    getBorderRegions() {
        return this.regionTileMap.getRegions().filter(region => {
            return this.isBorderRegion(region)
        })
    }

    getRegionDirection(sourceRegion, targetRegion) {
        return this.regionTileMap.getRegionDirection(sourceRegion, targetRegion)
    }

    getGroup(point) {
        const region = this.getRegion(point)
        return this.getGroupByRegion(region)
    }

    getNeighborGroups(group) {
        const edges = this.graph.getEdges(group.id)
        return edges.map(id => this.groups[id])
    }

    getGroupDirection(sourceGroup, targetGroup) {
        return this.directions.get(sourceGroup.id, targetGroup.id)
    }

    getGroupByRegion(region) {
        const id = this.regionToGroup.get(region.id)
        return this.groups[id]
    }

    getGroups() {
        return this.groups
    }

    getNeighborRegions(region) {
        return this.regionTileMap.getNeighborRegions(region)
    }

    isBorderRegion(region) {
        return this.borderRegions.has(region.id)
    }

    isRegionBorder(point) {
        return this.regionTileMap.isBorder(point)
    }

    isGroupBorder(point) {
        const neighborRegions = this.regionTileMap.getBorderRegions(point)
        if (neighborRegions.length === 0) return false
        const group = this.getGroup(point)
        for (let region of neighborRegions) {
            const id = this.regionToGroup.get(region.id)
            if (id !== group.id) return true
        }
        return false
    }

    getAverageRegionArea() {
        const regions = this.regionTileMap.getRegions()
        return Math.round(this.area / regions.length)
    }

    map(callback) {
        return this.groups.map(callback)
    }

    forEach(callback) {
        this.groups.forEach(callback)
    }
}


class RegionGroup {
    constructor(id, region, area) {
        this.id = id
        this.area = area
        this.origin = region.origin
    }
}


class RegionGroupFillConfig {
    constructor(id, model) {
        this.id = id
        this.area = 0
        this.model = model
        this.chance = model.groupChance
        this.growth = model.groupGrowth
    }

    isEmpty(region) {
        return !this.model.regionToGroup.has(region.id)
    }

    setValue(region) {
        this.model.regionToGroup.set(region.id, this.id)
        this.area += region.area
    }

    checkNeighbor(neighborRegion, region) {
        if (this.isEmpty(neighborRegion)) return
        const neighborGroupId = this.model.regionToGroup.get(neighborRegion.id)
        if (neighborGroupId === this.id) return
        this.model.borderRegions.add(region.id)
        this.model.graph.setEdge(this.id, neighborGroupId)
    }

    getNeighbors(region) {
        return this.model.regionTileMap.getNeighborRegions(region)
    }
}
