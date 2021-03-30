import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Graph } from '/lib/base/graph'
import { EvenPointSampling } from '/lib/base/point/sampling'
import { TileMap } from '/model/lib/tilemap'
import { UITileMap } from '/ui/tilemap'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'

import { RegionTileMap } from '/model/tilemap/region'

import { RegionGroupTileMapDiagram } from './diagram'
import { Group, RegionGroupTable, GroupFillConfig } from './group'


const SCHEMA = new Schema(
    'RegionGroupTileMap',
    Type.number('width', 'W', {default: 150, step: 1, min: 10, max: 500}),
    Type.number('height', 'H', {default: 100, step: 1, min: 10, max: 500}),
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
        const originPoints = EvenPointSampling.create(width, height, groupScale)
        const data = {width, height, scale, seed, chance, growth}
        const regionTileMap = RegionTileMap.fromData(data)
        const table = new RegionGroupTable(regionTileMap)
        const graph = new Graph()

        const organicFills = originPoints.map((origin, id) => {
            const region = regionTileMap.getRegion(origin)
            const group = new Group(id, region)
            const fillConfig = new GroupFillConfig({
                groupChance: params.get('groupChance'),
                groupGrowth: params.get('groupGrowth'),
                group, table, graph,
            })
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(organicFills).fill()

        this.table = table
        this.graph = graph
    }

    getRegion(point) {
        return this.table.getRegion(point)
    }

    getGroup(point) {
        const region = this.table.getRegion(point)
        return this.table.getGroup(region)
    }

    isRegionBorder(point) {
        return this.table.isRegionBorder(point)
    }

    isGroupBorderPoint(point) {
        if (! this.isRegionBorder(point)) return false
        const group = this.getGroup(point)
        const borderRegions = this.table.getBorderRegions(point)
        return this.table.isGroupBorder(group, borderRegions)

    }

    isBorderRegion(region) {
        return this.table.borderRegions.has(region.id)
    }

    map(callback) {
        return this.table.map(group => callback(group))
    }

    forEach(callback) {
        this.table.forEach(callback)
    }
}