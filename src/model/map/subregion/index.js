import { Matrix } from '/lib/base/matrix'
import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { BaseMap } from '/model/lib/map'
import { MapUI } from '/lib/ui/map'

import RegionMap from '/model/map/region'

import { MapDiagram } from './diagram'


const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 150, step: 1, min: 1}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1}),
    Type.number('scale', 'Scale', {default: 30, step: 1, min: 1}),
    Type.number('subscale', 'Sub scale', {default: 3, step: 1, min: 1}),
    Type.number('growth', 'Growth', {default: 25, step: 1, min: 0}),
    Type.number('chance', 'Chance', {default: 0.3, step: 0.01, min: 0.1, max: 1}),
    Type.number('subgrowth', 'Sub growth', {default: 0, step: 1, min: 0}),
    Type.number('subchance', 'Sub chance', {default: 0.1, step: 0.01, min: 0.1, max: 1}),
    Type.text('seed', 'Seed', {default: ''})
)


export default class SubRegionMap extends BaseMap {
    static id = 'SubRegion map'
    static diagram = MapDiagram
    static schema = SCHEMA
    static ui = MapUI

    static create(params) {
        return new SubRegionMap(params)
    }

    constructor(params) {
        super(params)
        this.regionMap = buildRegionMap(params)
        this.subRegionMap = buildSubRegionMap(params)
    }

    getRegion(point) {
        return this.regionMap.getRegion(point)
    }

    getSubRegion(point) {
        return this.subRegionMap.getRegion(point)
    }

    isRegionBorder(point) {
        return this.regionMap.isBorder(point)
    }

    isSubRegionBorder(point) {
        return this.subRegionMap.isBorder(point)
    }

    map(callback) {
        return this.regionMap.map(region => callback(region))
    }
}


function buildRegionMap(params) {
    return RegionMap.fromData({
        width: params.get('width'),
        height: params.get('height'),
        scale: params.get('scale'),
        seed: params.get('seed'),
        chance: params.get('chance'),
        growth: params.get('growth'),
    })
}


function buildSubRegionMap(params) {
    return RegionMap.fromData({
        width: params.get('width'),
        height: params.get('height'),
        scale: params.get('subscale'),
        seed: params.get('seed'),
        chance: params.get('subchance'),
        growth: params.get('subgrowth'),
    })
}
