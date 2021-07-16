import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMap } from '/model/lib/tilemap'
import { UITileMap } from '/ui/tilemap'

import { RegionGroupTileMapDiagram } from './diagram'
import { RegionGroupModel } from './model'


const SCHEMA = new Schema(
    'RegionGroupTileMap',
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
    static id = 'RegionGroupTileMap'
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
        const model = new RegionGroupModel(this.seed, params)
        this.regionTileMap = model.regionTileMap
        this.directions = model.directions
        this.graph = model.graph
        this.regionToGroup = model.regionToGroup
        this.groups = model.groups
        this.borderRegions = model.borderRegions

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
        return edges.map(id => this.groups.get(id))
    }

    getGroupDirection(sourceGroup, targetGroup) {
        return this.directions.get(sourceGroup.id, targetGroup.id)
    }

    getGroupByRegion(region) {
        const id = this.regionToGroup.get(region.id)
        return this.groups.get(id)
    }

    getGroups() {
        return Array.from(this.groups.values())
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

    map(callback) {
        return [...this.groups.values()].map(callback)
    }

    forEach(callback) {
        this.groups.forEach(callback)
    }
}
