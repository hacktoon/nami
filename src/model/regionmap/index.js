import { BaseMap } from '/model/lib/map'
import { EvenPointSampling } from '/lib/base/point/sampling'
import { OrganicFill } from '/lib/floodfill/organic'
import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'

import { RegionSet } from './region'
import { RegionCell } from './cell'
import { Matrix } from '/lib/base/matrix'
import { MapDiagram } from './diagram'
import { MapUI } from '/lib/ui/map'


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
        const map = new Map(Object.entries(data))
        const params = RegionMap.schema.parse(map)
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
        this.matrix = this.#buildGrid()
    }

    get(point) {
        return this.matrix.get(point)
    }

    #buildGrid() {
        const matrix = new Matrix(this.width, this.height, () => new RegionCell())
        const fillMap = this.#createFillMap(matrix, this.regionSet)
        let totalPoints = this.area
        while(totalPoints > 0) {
            this.regionSet.forEach(region => {
                const points = fillMap[region.id].grow()
                totalPoints -= points.length
            })
        }
        return matrix
    }

    #createFillMap(matrix, regionSet) {
        const buildParams = region => ({
            isEmpty:   point => matrix.get(point).isEmpty(),
            isSeed:    point => matrix.get(point).isSeed(region),
            isNeighbor: point => matrix.get(point).isNeighbor(region),
            setOrigin: point => matrix.get(point).setOrigin(),
            setBorder: (point, neighbor) => matrix.get(point).setBorder(neighbor),
            setSeed:   point => matrix.get(point).setSeed(region),
            setValue:  point => matrix.get(point).setRegion(region),
            setLayer:  (point, layer) => matrix.get(point).setLayer(layer),
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
