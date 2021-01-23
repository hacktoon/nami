import { BaseMap } from '/model/lib/map'
import { RandomPointDistribution } from '/lib/point/distribution'
import { OrganicFill } from '/lib/flood-fill'
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
        this.layerGrowth = params.get('layerGrowth')
        this.growthChance = params.get('growthChance')
        this.grid = new Grid(this.width, this.height, () => new RegionCell())
        const origins = RandomPointDistribution.create(
            params.get('count'), this.width, this.height
        )
        this.regionSet = new RegionSet(origins)

        this.fillMap = this.#createFillMap()
        this.#fillRegions()

        // this.regionSet.forEach(region => {

        // })
    }

    at(point) {
        return this.grid.get(point)
    }

    regionAt(point) {
        const id = this.at(point).value
        return this.regionSet.get(id)
    }

    #createFillMap() {
        const entries = this.regionSet.map(region => {
            const fill = this.#createOrganicFill(region)
            return [region.id, fill]
        })
        return new Map(entries)
    }

    #createOrganicFill(region) {
        const hooks = {
            setBorder: (point, neighbor) => {
                this.at(point).setBorder()
                region.addBorder(point, neighbor)
            },
            setOrigin:  point => this.at(point).setOrigin(),
            setSeed:    point => this.at(point).setSeed(region.id),
            setValue:   point => this.at(point).setValue(region.id),
            setLayer:   (point, layer) => this.at(point).setLayer(layer),
            isEmpty:    point => this.at(point).isEmpty(),
            isSeed:     point => this.at(point).isSeed(region.id),
            isBlocked:  point => this.at(point).isBlocked(region.id),
            layerGrowth: this.layerGrowth,
            growthChance: this.growthChance
        }
        return new OrganicFill(region.origin, hooks)
    }

    #fillRegions(){
        let totalPoints = this.area

        while(totalPoints > 0) {
            this.regionSet.forEach(region => {

                const points = this.fillMap.get(region.id).fill(region.id)
                totalPoints -= region.grow(points)
            })
        }
    }
}
