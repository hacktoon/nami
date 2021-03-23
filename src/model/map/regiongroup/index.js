import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { sum } from '/lib/base/number'
import { Graph } from '/lib/base/graph'
import { EvenPointSampling } from '/lib/base/point/sampling'
import { BaseMap } from '/model/lib/map'
import { MapUI } from '/lib/ui/map'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'

import RegionMap from '/model/map/region'

import { MapDiagram } from './diagram'
import { Group, GroupMap, GroupFillConfig } from './group'


const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 150, step: 1, min: 10, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 10, max: 500}),
    Type.number('groupScale', 'Group scale', {default: 30, step: 1, min: 1}),
    Type.number('scale', 'Scale', {default: 2, step: 1, min: 1}),
    Type.number('growth', 'Growth', {default: 0, step: 1, min: 0}),
    Type.number('chance', 'Chance', {default: 0.1, step: 0.01, min: 0.1, max: 1}),
    Type.text('seed', 'Seed', {default: ''})
)


export default class RegionGroupMap extends BaseMap {
    static id = 'RegionGroupMap'
    static diagram = MapDiagram
    static schema = SCHEMA
    static ui = MapUI

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
        const regionData = {width, height, scale, seed, chance, growth}
        const origins = EvenPointSampling.create(width, height, groupScale)
        this.regionMap = RegionMap.fromData(regionData)
        this.regionToGroup = new Map()
        this.groupIndex = new Map()
        this.graph = new Graph()
        this.groups = []

        const organicFills = origins.map((origin, id) => {
            const region = this.regionMap.getRegion(origin)
            const group = new Group(id, region)
            const refs = {
                regionToGroup: this.regionToGroup,
                regionMap: this.regionMap,
                graph: this.graph,
                group: group
            }
            const fillConfig = new GroupFillConfig(refs, params)
            this.groupIndex.set(group.id, group)
            this.groups.push(group)
            return new OrganicFloodFill(region, fillConfig)
        })

        new MultiFill(organicFills).fill()
    }

    getRegion(point) {
        return this.regionMap.getRegion(point)
    }

    getGroup(point) {
        const region = this.regionMap.getRegion(point)
        return this.regionToGroup.get(region.id)
    }

    isRegionBorder(point) {
        return this.regionMap.isBorder(point)
    }

    map(callback) {
        return this.groups.map(callback)
    }

    forEach(callback) {
        this.groups.forEach(callback)
    }
}
