import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Matrix } from '/lib/base/matrix'
import { BaseMap } from '/model/lib/map'
import { MapUI } from '/lib/ui/map'

import RegionMap from '/model/map/region'

import { MapDiagram } from './diagram'


const SCHEMA = new Schema(
    Type.number('width', 'W', {default: 150, step: 1, min: 1}),
    Type.number('height', 'H', {default: 100, step: 1, min: 1}),
    Type.number('scale', 'Scale', {default: 30, step: 1, min: 1}),
    Type.number('subscale', 'Subscale', {default: 4, step: 1, min: 1}),
    Type.number('growth', 'Growth', {default: 25, step: 1, min: 0}),
    Type.number('chance', 'Chance', {default: 0.3, step: 0.01, min: 0.1, max: 1}),
    Type.number('subgrowth', 'Subgrowth', {default: 4, step: 1, min: 0}),
    Type.number('subchance', 'Subchance', {default: 0.1, step: 0.01, min: 0.1, max: 1}),
    Type.text('seed', 'Seed', {default: 'a'})
)


export default class SubRegionMap extends BaseMap {
    static id = 'SubRegion map'
    static diagram = MapDiagram
    static schema = SCHEMA
    static ui = MapUI

    static fromData(data) {
        const map = new Map(Object.entries(data))
        const params = SubRegionMap.schema.parse(map)
        return new SubRegionMap(params)
    }

    static create(params) {
        return new SubRegionMap(params)
    }

    constructor(params) {
        super(params)
        const [width, height] = params.get('width', 'height')
        const [seed, scale] = params.get('seed', 'scale')

        this.regionMap = RegionMap.fromData({
            width, height, scale, seed,
            chance: params.get('chance'),
            growth: params.get('growth'),
        })

        this.subRegionMap = RegionMap.fromData({
            width, height, seed,
            scale: params.get('subscale'),
            chance: params.get('subchance'),
            growth: params.get('subgrowth'),
        })

        // maps in which region a subregion is, by its origin
        this.subRegionTable = new Map()
        this.subRegionMap.map(subregion => {
            const region = this.regionMap.getRegion(subregion.origin)
            this.subRegionTable.set(subregion.id, region)
        })
    }

    getRegion(point) {
        const subregion = this.subRegionMap.getRegion(point)
        return this.subRegionTable.get(subregion.id)
    }

    getSubRegion(point) {
        return this.subRegionMap.getRegion(point)
    }

    getBorderRegion(point) {
        return this.subRegionMap.getBorderRegion(point)
    }

    isRegionBorder(point) {
        const subregion = this.subRegionMap.getRegion(point)
        const isSubRegionBorder = this.subRegionMap.isBorder(point)
        return isSubRegionBorder
    }

    isSubRegionBorder(point) {
        return this.subRegionMap.isBorder(point)
    }

    map(callback) {
        return this.regionMap.map(region => callback(region))
    }
}
