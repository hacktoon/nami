import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Matrix } from '/lib/base/matrix'
import { BaseMap } from '/model/lib/map'
import { MapUI } from '/lib/ui/map'

import RegionMap from '/model/map/region'

import { MapDiagram } from './diagram'


const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 150, step: 1, min: 1}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1}),
    Type.number('scale', 'Scale', {default: 30, step: 1, min: 1}),
    Type.number('growth', 'Growth', {default: 25, step: 1, min: 0}),
    Type.number('chance', 'Chance', {default: 0.3, step: 0.01, min: 0.1, max: 1}),
    Type.text('seed', 'Seed', {default: 'a'})
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
        const data = {width, height, scale, seed, chance, growth}

        this.regionMap = RegionMap.fromData(data)

        console.log(this.regionMap.origins.length);
        this.regionMap.map(region => {

        })
    }

    getRegion(point) {
        return this.regionMap.getRegion(point)
    }

    getBorderRegion(point) {
        return this.regionMap.getBorderRegion(point)
    }

    isRegionBorder(point) {
        return this.regionMap.isBorder(point)
    }

    map(callback) {
        return this.regionMap.map(region => callback(region))
    }
}
