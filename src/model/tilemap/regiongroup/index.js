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
        return {
            region: region.id,
            group: this.getGroup(point).id,
            hbr: this.isBorderRegion(region)
        }
    }

    getGroupsDescOrder() {
        const cmpDescArea = (g0, g1) => g1.area - g0.area
        return this.model.map(group => group).sort(cmpDescArea)
    }

    getRegion(point) {
        return this.model.getRegion(point)
    }

    getRegions() {
        return this.model.regionTileMap.map(r => r)
    }

    getGroup(point) {
        const region = this.model.getRegion(point)
        return this.model.getGroup(region)
    }

    getRegionLayer(region) {
        return this.model.getRegionLayer(region)
    }

    isRegionBorder(point) {
        return this.model.isRegionBorder(point)
    }

    isGroupBorderPoint(point) {
        if (! this.isRegionBorder(point)) return false
        const group = this.getGroup(point)
        const borderRegions = this.model.getTileBorderRegions(point)
        return this.model.isGroupBorder(group, borderRegions)
    }

    isBorderRegion(region) {
        return this.model.hasBorderRegions(region)
    }

    map(callback) {
        return this.model.map(group => callback(group))
    }

    forEach(callback) {
        this.model.forEach(callback)
    }
}

