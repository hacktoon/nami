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
 } from './data'


const SCHEMA = new Schema(
    'RegionGroupTileMap',
    Type.number('width', 'W', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'H', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('groupScale', 'Gr Scale', {default: 34, step: 1, min: 1}),
    Type.number('groupChance', 'Gr Chance', {default: 0.2, step: 0.1, min: 0.1, max: 1}),
    Type.number('groupGrowth', 'Gr Growth', {default: 12, step: 1, min: 0}),
    Type.number('scale', 'Rg scale', {default: 2, step: 1, min: 1}),
    Type.number('growth', 'Rg growth', {default: 0, step: 1, min: 0}),
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
        const [width, height, seed] = params.get('width', 'height', 'seed')
        const [scale, chance, growth] = params.get('scale', 'chance', 'growth')
        const groupScale = params.get('groupScale')
        const origins = EvenPointSampling.create(width, height, groupScale)
        const data = {width, height, scale, seed, chance, growth}
        const regionTileMap = RegionTileMap.fromData(data)
        this.graph = new Graph()
        this.data = this._buildTable(regionTileMap, origins, params)

        this._buildLayerMap()
    }

    _buildTable(regionTileMap, origins, params) {
        const data = new RegionGroupData(regionTileMap)
        const organicFills = origins.map((origin, id) => {
            const region = regionTileMap.getRegion(origin)
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

    _buildLayerMap() {
        const borderRegions = this.data.getRegionsAtBorders()
        const floodFills = borderRegions.map(region => {
            const fillConfig = new RegionLayerFillConfig({
                region, data: this.data
            })
            return new FloodFill(region, fillConfig)
        })
        new MultiFill(floodFills).fill()
    }

    get(point) {
        return {
            region: this.getRegion(point).id,
            group: this.getGroup(point).id,
        }
    }

    get groups() {
        return this.data.map(group => group)
    }

    getRegion(point) {
        return this.data.getRegion(point)
    }

    getGroup(point) {
        const region = this.data.getRegion(point)
        return this.data.getGroup(region)
    }

    getRegionLayer(region) {
        return this.data.getRegionLayer(region)
    }

    getGroupLayer(region) {
        return this.data.getGroupLayer(region)
    }

    isRegionBorder(point) {
        return this.data.isRegionBorder(point)
    }

    isGroupBorderPoint(point) {
        if (! this.isRegionBorder(point)) return false
        const group = this.getGroup(point)
        const borderRegions = this.data.getBorderRegionsAt(point)
        return this.data.isGroupBorder(group, borderRegions)
    }

    isBorderRegion(region) {
        return this.data.hasBorderRegions(region)
    }

    map(callback) {
        return this.data.map(group => callback(group))
    }

    forEach(callback) {
        this.data.forEach(callback)
    }
}
