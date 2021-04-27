import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Graph } from '/lib/base/graph'
import { EvenPointSampling } from '/lib/base/point/sampling'
import { TileMap } from '/model/lib/tilemap'
import { UITileMap } from '/ui/tilemap'
import { MultiFill } from '/lib/floodfill'
import { FloodFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'

import { RegionTileMap } from '/model/tilemap/region'

import { RegionGroupTileMapDiagram } from './diagram'
import {
    RegionGroup,
    RegionGroupData,
    RegionGroupFillConfig,
    RegionLayerFillConfig
 } from './model'


const SCHEMA = new Schema(
    'RegionGroupTileMap',
    Type.number('width', 'W', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'H', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('groupScale', 'Gr Scale', {default: 34, step: 1, min: 1, max: 100}),
    Type.number('groupChance', 'Gr Chance', {default: 0.2, step: 0.1, min: 0.1, max: 1}),
    Type.number('groupGrowth', 'Gr Growth', {default: 12, step: 1, min: 0, max: 100}),
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
        const origins = this._buildOrigins(params)
        this.regionTileMap = this._buildRegionTileMap(params)
        this.graph = new Graph()
        this.model = this._buildTable(origins, params)
        this._buildLayerMap(params)
    }

    _buildOrigins(params) {
        const [width, height] = params.get('width', 'height')
        const groupScale = params.get('groupScale')
        return EvenPointSampling.create(width, height, groupScale)
    }

    _buildRegionTileMap(params) {
        const [width, height] = params.get('width', 'height')
        const [scale, chance, growth] = params.get('scale', 'chance', 'growth')
        const data = {width, height, scale, seed: this.seed, chance, growth}
        return RegionTileMap.fromData(data)
    }

    _buildTable(origins, params) {
        const data = new RegionGroupData(this.regionTileMap)
        const organicFills = origins.map((origin, id) => {
            const region = this.regionTileMap.getRegion(origin)
            const group = new RegionGroup(id, region)
            const fillConfig = new RegionGroupFillConfig({
                groupChance: params.get('groupChance'),
                groupGrowth: params.get('groupGrowth'),
                graph: this.graph,
                data,
                group,
            })
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(organicFills).fill()
        return data
    }

    _buildLayerMap(params) {
        const borderRegions = this.model.getRegionsAtBorders()
        const floodFills = borderRegions.map(region => {
            const fillConfig = new RegionLayerFillConfig({
                groupChance: params.get('groupChance'),
                groupGrowth: params.get('groupGrowth'),
                region, data: this.model
            })
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(floodFills).fill()
    }

    get(point) {
        return {
            region: this.getRegion(point).id,
            group: this.getGroup(point).id,
        }
    }

    getGroupsDescOrder() {
        const cmpDescArea = (g0, g1) => g1.area - g0.area
        return this.model.groups.sort(cmpDescArea)
    }

    getRegion(point) {
        return this.model.getRegion(point)
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
        const borderRegions = this.model.getBorderRegionsAt(point)
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
