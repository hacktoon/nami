import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Graph } from '/lib/base/graph'
import { EvenPointSampling } from '/lib/base/point/sampling'
import { BaseMap } from '/model/lib/map'
import { UIMap } from '/lib/ui/map'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'

import RegionMap from '/model/map/region'

import { MapDiagram } from './diagram'
import { Group, RegionGroupTable, GroupFillConfig } from './group'


const SCHEMA = new Schema(
    Type.number('width', 'W', {default: 150, step: 1, min: 10, max: 500}),
    Type.number('height', 'H', {default: 100, step: 1, min: 10, max: 500}),
    Type.number('groupScale', 'Gr Scale', {default: 33, step: 1, min: 1}),
    Type.number('groupChance', 'Gr Chance', {default: 0.2, step: 0.1, min: 0.1, max: 1}),
    Type.number('groupGrowth', 'Gr Growth', {default: 12, step: 1, min: 0}),
    Type.number('scale', 'Rg scale', {default: 2, step: 1, min: 1}),
    Type.number('growth', 'Rg growth', {default: 0, step: 1, min: 0}),
    Type.number('chance', 'Rg chance', {default: 0.1, step: 0.1, min: 0.1, max: 1}),
    Type.text('seed', 'Seed', {default: ''})
)


export default class RegionGroupMap extends BaseMap {
    static id = 'RegionGroupMap'
    static diagram = MapDiagram
    static schema = SCHEMA
    static ui = UIMap

    static fromData(data) {
        const map = new Map(Object.entries(data))
        const params = RegionGroupMap.schema.parse(map)
        return new RegionGroupMap(params)
    }

    static create(params) {
        return new RegionGroupMap(params)
    }

    constructor(params) {
        super(params)
        const [width, height, seed] = params.get('width', 'height', 'seed')
        const [scale, chance, growth] = params.get('scale', 'chance', 'growth')
        const groupScale = params.get('groupScale')

        const originPoints = EvenPointSampling.create(width, height, groupScale)
        const regionMap = RegionMap.fromData({width, height, scale, seed, chance, growth})
        this.table = new RegionGroupTable(regionMap)
        this.graph = new Graph()

        const organicFills = originPoints.map((origin, id) => {
            const region = regionMap.getRegion(origin)
            const fillConfig = new GroupFillConfig({
                groupChance: params.get('groupChance'),
                groupGrowth: params.get('groupGrowth'),
                group: new Group(id, region),
                table: this.table,
                graph: this.graph,
            })
            return new OrganicFloodFill(region, fillConfig)
        })

        new MultiFill(organicFills).fill()
    }

    getRegion(point) {
        return this.table.regionMap.getRegion(point)
    }

    getGroup(point) {
        const region = this.table.getRegionAtPoint(point)
        return this.table.getGroup(region)
    }

    isRegionBorderPoint(point) {
        return this.table.regionMap.isBorder(point)
    }

    isGroupBorderPoint(point) {
        if (! this.isRegionBorderPoint(point)) return false
        const group = this.getGroup(point)
        const borderRegion = this.table.regionMap.getBorderRegion(point)
        const borderGroup = this.table.getGroup(borderRegion)
        return group.id !== borderGroup.id
    }

    map(callback) {
        return this.table.map(group => callback(group))
    }

    forEach(callback) {
        this.table.forEach(callback)
    }
}