import { BaseMap } from '/model/lib/map'
import { RandomPointDistribution } from '/lib/point/distribution'
import { Schema, Type } from '/lib/schema'

import { RegionSet, RegionMapFill } from './region'
import { RegionCell } from './cell'
import { Grid } from '/lib/grid'
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
        this.layerGrowth = params.get('layerGrowth')
        this.growthChance = params.get('growthChance')
        this.grid = new Grid(this.width, this.height, () => new RegionCell())
        const origins = RandomPointDistribution.create(
            params.get('count'), this.width, this.height
        )
        this.regionSet = new RegionSet(origins)

        const regionFill = new RegionMapFill(this)
        this.regionSet.forEach(region => {
            console.log(region.id);
        })
    }

    at(point) {
        return this.grid.get(point)
    }

    get(point) {
        const id = this.at(point).value
        return this.regionSet.get(id)
    }

    isOrigin(point) {
        return this.at(point).isOrigin()
    }

    isBorder(point) {
        return this.at(point).isBorder()
    }

    isLayer(point, layer) {
        return this.at(point).isLayer(layer)
    }

    isOverLayer(point, layer) {
        return this.at(point).layer > layer
    }

    isBlocked(point, value) {
        const cell = this.at(point)
        let isFilled = !cell.isEmpty() && !cell.isValue(value)
        let isAnotherSeed = !cell.isEmptySeed() && !cell.isSeed(value)
        return isFilled || isAnotherSeed
    }
}
