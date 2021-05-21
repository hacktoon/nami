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
        const params = RegionGroupTileMap.schema.parse(map)
        return new RegionGroupTileMap(params)
    }

    static create(params) {
        return new RegionGroupTileMap(params)
    }

    constructor(params) {
        super(params)
        this.model = new RegionGroupModel(this.seed, params)
    }

    get(point) {
        const region = this.getRegion(point)
        const group = this.getGroup(point)
        const neighborRegions = this.getNeighborRegions(region)
        const neighborGroups = this.getNeighborGroups(point)

        return {
            group: group.id,
            region: region.id,
            neighborGroups: neighborGroups.join(', '),
            neighborRegions: neighborRegions.map(r=>r.id).join(', '),
            regionArea: region.area,
        }
    }

    getGroupsDescOrder() {
        const cmpDescendingCount = (g0, g1) => g1.count - g0.count
        return this.getGroups().sort(cmpDescendingCount)
    }

    getRegion(point) {
        return this.model.regionTileMap.getRegion(point)
    }

    getRegions() {
        return this.model.regionTileMap.getRegions()
    }

    getGroup(point) {
        const region = this.getRegion(point)
        const id = this.model.regionToGroup.get(region.id)
        return this.model.groups.get(id)
    }

    getGroups() {
        return Array.from(this.model.groups.values())
    }

    isBorderRegion(region) {
        return this.model.borderRegions.has(region.id)
    }

    getNeighborRegions(region) {
        return this.model.regionTileMap.getNeighborRegions(region)
    }

    getNeighborGroups(point) {
        const region = this.getRegion(point)
        const group = this.getGroup(point)
        const neighborRegions = this.getNeighborRegions(region)
        const neighborGroupIds = new Set()
        neighborRegions.forEach(neighborRegion => {
            const id = this.model.regionToGroup.get(neighborRegion.id)
            if (id !== group.id) {
                neighborGroupIds.add(id)
            }
        })
        return Array.from(neighborGroupIds)
    }

    getGraph() {
        return this.model.graph
    }

    isRegionBorder(point) {
        return this.model.regionTileMap.isBorder(point)
    }

    isGroupBorder(point) {
        const neighborRegions = this.model.regionTileMap.getBorderRegions(point)
        if (neighborRegions.length === 0) return false
        const group = this.getGroup(point)
        for (let region of neighborRegions) {
            const id = this.model.regionToGroup.get(region.id)
            if (id !== group.id) return true
        }
        return false
    }

    map(callback) {
        return this.model.map(group => callback(group))
    }

    forEach(callback) {
        this.model.forEach(callback)
    }
}

