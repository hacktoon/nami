import { BaseMap } from '/model/lib/map'
import { EvenPointSampling } from '/lib/point/sampling'
import { OrganicFill } from '/lib/floodfill/organic'
import { Schema, Type } from '/lib/schema'

import { RegionSet } from './region'
import { RegionCell } from './cell'
import { Grid } from '/lib/grid'
import { MapDiagram } from './diagram'
import { MapUI } from '/ui/map'


const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 200, step: 1, min: 1}),
    Type.number('height', 'Height', {default: 150, step: 1, min: 1}),
    Type.number('count', 'Count', {default: 15, step: 1, min: 1}),
    Type.number('layerGrowth', 'Layer growth', {
        default: 30, step: 1, min: 1
    }),
    Type.number('growthChance', 'Growth chance', {
        default: 0.1, step: 0.01, min: 0.01
    }),
    Type.text('seed', 'Seed', {default: ''})
)


export default class RegionMap extends BaseMap {
    static diagram = MapDiagram
    static label = 'Region map'
    static schema = SCHEMA
    static ui = MapUI

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
        const origins = EvenPointSampling.create(
            this.count, this.width, this.height
        )
        this.regionSet = new RegionSet(origins)
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
                const points = fillMap[region.id].grow()
                totalPoints -= points.length
            })
        }
        return grid
    }

    #createFillMap(grid, regionSet) {
        const buildParams = region => ({
            isEmpty:   point => grid.get(point).isEmpty(),
            isSeed:    point => grid.get(point).isSeed(region),
            isNeighbor: point => grid.get(point).isNeighbor(region),
            setOrigin: point => grid.get(point).setOrigin(),
            setBorder: (point, neighbor) => grid.get(point).setBorder(neighbor),
            setSeed:   point => grid.get(point).setSeed(region),
            setValue:  point => grid.get(point).setRegion(region),
            setLayer:  (point, layer) => grid.get(point).setLayer(layer),
            layerGrowth: this.layerGrowth,
            growthChance: this.growthChance
        })
        const map = {}
        regionSet.forEach(region => {
            map[region.id] = new OrganicFill(region.origin, buildParams(region))
        })
        return map
    }
}
