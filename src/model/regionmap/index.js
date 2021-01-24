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
        this.grid = new Grid(this.width, this.height, () => new RegionCell())
        this.regionSet = new RegionSet(RandomPointDistribution.create(
            this.count, this.width, this.height
        ))
        this.#fillRegions()
    }

    get(point) {
        return this.grid.get(point)
    }

    #fillRegions() {
        const fillMap = this.#createFillMap(this.regionSet)
        let totalPoints = this.area
        while(totalPoints > 0) {
            this.regionSet.forEach(region => {
                // FIXME: avoid undefined values (seed/value diff)
                // see region.addBorder for region checking
                console.log(region.neighbors);
                const points = fillMap.get(region.id).fill(region.id)
                totalPoints -= region.grow(points)
            })
        }
    }

    #createFillMap(regionSet) {
        const entries = regionSet.map(region => {
            const fill = this.#createOrganicFill(region)
            return [region.id, fill]
        })
        return new Map(entries)
    }

    #createOrganicFill(region) {
        const hooks = {
            setBorder: (point, neighborPoint) => {
                this.get(point).setBorder()
                region.addBorder(point, this.get(neighborPoint).region)
            },
            setOrigin:  point => this.get(point).setOrigin(),
            setSeed:    point => this.get(point).setSeed(region),
            isSeed:     point => this.get(point).isSeed(region),
            setValue:   point => this.get(point).setRegion(region),
            setLayer:   (point, layer) => this.get(point).setLayer(layer),
            isEmpty:    point => this.get(point).isEmpty(),
            isBlocked:  point => this.get(point).isBlocked(region),
            layerGrowth: this.layerGrowth,
            growthChance: this.growthChance
        }
        return new OrganicFill(region.origin, hooks)
    }
}
