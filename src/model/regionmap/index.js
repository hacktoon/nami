import { BaseMap } from '/model/lib/map'
import { RandomPointDistribution } from '/lib/point/distribution'
import { Schema, Type } from '/lib/schema'

import { RegionSet, RegionMapFill } from './region'
import { RegionGrid } from './grid'
import { MapDiagram } from './diagram'


export default class RegionMap extends BaseMap {
    static id = 'RegionMap'

    static schema = new Schema(
        Type.number('width', 'Width', 200, {step: 1, min: 1}),
        Type.number('height', 'Height', 150, {step: 1, min: 1}),
        Type.number('count', 'Count', 12, {step: 1, min: 1}),
        Type.number('layerGrowth', 'Layer growth', 30, {step: 1, min: 1}),
        Type.number('growthChance', 'Growth chance', 0.1, {step: 0.01, min: 0.01}),
        Type.text('seed', 'Seed', '')
    )
    static diagram = MapDiagram

    static create(params) {
        return new RegionMap(params)
    }

    static fromData(data) {
        const params = new Map(Object.entries(data))
        return new RegionMap(params)
    }

    constructor(params) {
        super(params)
        this.grid = new RegionGrid(this.width, this.height)
        const origins = RandomPointDistribution.create(
            params.get('count'), this.width, this.height
        )
        this.regionSet = new RegionSet(origins)

        const regionFill = new RegionMapFill(this, params)
        // this.regions.forEach((item, index) => {
        //
        // })
    }

    get(point) {
        const id = this.grid.get(point).value
        return this.regions.get(id)
    }

    isOrigin(point) {
        return this.grid.get(point).isOrigin()
    }

    setOrigin(point) {
        return this.grid.get(point).setOrigin()
    }

    isSeed(point, value) {
        if (this.isEmpty(point))
            return false
        return this.grid.isSeed(point, value)
    }

    isEmpty(point) {
        return this.grid.isEmpty(point)
    }

    isBorder(point) {
        return this.grid.isBorder(point)
    }

    getLayer(point) {
        return this.grid.getLayer(point)
    }

    isLayer(point, layer) {
        return this.grid.get(point).isLayer(layer)
    }

    isOverLayer(point, layer) {
        return this.getLayer(point) > layer
    }
}
