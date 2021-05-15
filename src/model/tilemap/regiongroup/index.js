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
    Type.number('groupScale', 'Gr Scale', {default: 25, step: 1, min: 1, max: 100}),
    Type.number('groupChance', 'Gr Chance', {default: 0.2, step: 0.1, min: 0.1, max: 1}),
    Type.number('groupGrowth', 'Gr Growth', {default: 35, step: 1, min: 0, max: 100}),
    Type.number('scale', 'Rg scale', {default: 2, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Rg growth', {default: 0, step: 1, min: 0, max: 100}),
    Type.number('chance', 'Rg chance', {default: 0.1, step: 0.1, min: 0.1, max: 1}),
    Type.text('seed', 'Seed', {default: '1621117818113'})
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
        return {
            region: region.id,
            group: this.getGroup(point).id,
            isBorderRegion: this.isBorderRegion(region)
        }
    }

    getGroupsDescOrder() {
        const cmpDescendingCount = (g0, g1) => g1.count - g0.count
        return this.model.getGroups().sort(cmpDescendingCount)
    }

    getRegion(point) {
        return this.model.regionTileMap.getRegion(point)
    }

    getRegions() {
        return this.model.regionTileMap.getRegions()
    }

    getGroups() {
        return Array.from(this.model.groups.values())
    }

    getGroup(point) {
        const region = this.getRegion(point)
        const id = this.model.regionToGroup.get(region.id)
        return this.model.groups.get(id)
    }

    getBorderRegions() {
        const ids = Array.from(this.model.borderRegions.values())
        return ids.map(id => this.model.regionTileMap.getRegionById(id))
    }

    isRegionBorder(point) {
        return this.model.regionTileMap.isBorder(point)
    }

    isGroupBorderPoint(point) {
        if (! this.isRegionBorder(point)) return false
        const group = this.getGroup(point)
        const borderRegions = this.getTileBorderRegions(point)
        return this.isGroupBorder(group, borderRegions)
    }

    isGroupBorder(group, borderRegions) {
        for(let region of borderRegions) {
            const id = this.model.regionToGroup.get(region.id)
            const borderGroup = this.model.groups.get(id)
            if (group.id !== borderGroup.id) return true
        }
        return false
    }

    getTileBorderRegions(point) {
        return this.model.regionTileMap.getTileBorderRegions(point)
    }

    isBorderRegion(region) {
        return this.model.borderRegions.has(region.id)
    }

    map(callback) {
        return this.model.map(group => callback(group))
    }

    forEach(callback) {
        this.model.forEach(callback)
    }
}

