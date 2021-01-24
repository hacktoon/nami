import { BaseMap } from '/model/lib/map'
import { RandomPointDistribution } from '/lib/point/distribution'
import { OrganicFill } from '/lib/flood-fill/organic'
import { Schema, Type } from '/lib/schema'

import { RegionSet } from './region'
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
        this.count = params.get('count')
        this.layerGrowth = params.get('layerGrowth')
        this.growthChance = params.get('growthChance')
        this.regionSet = new RegionSet(RandomPointDistribution.create(
            this.count, this.width, this.height
        ))
        this.grid = this.#buildGrid()
    }

    get(point) {
        return this.grid.get(point)
    }

    #buildGrid() {
        const grid = new Grid(this.width, this.height, () => new RegionCell())
        const fillMap = this.#createFillMap(grid, this.regionSet)
        let totalPoints = this.area
        while(totalPoints > 0) {
            this.regionSet.forEach(region => {
                // FIXME: avoid undefined values (seed/value diff)
                // see region.addBorder for region checking
                // console.log(region.neighbors);
                const points = fillMap.get(region.id).fill(region.id)
                totalPoints -= region.grow(points)
            })
        }
        return grid
    }

    #createFillMap(grid, regionSet) {
        const params = {
            layerGrowth: this.layerGrowth,
            growthChance: this.growthChance
        }
        const entries = regionSet.map(region => [
            region.id, new OrganicFill(region, grid, params)
        ])
        return new Map(entries)
    }
}
