import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { RandomPointSampling, EvenPointSampling } from '/lib/base/point/sampling'
import { OrganicMultiFill } from '/lib/floodfill/organic'
import { MapUI } from '/lib/ui/map'
import { BaseMap } from '/model/lib/map'

import { MapDiagram } from './diagram'
import { RegionMapMatrix } from './matrix'


const SAMPLING_ENTRIES = [
    RandomPointSampling,
    EvenPointSampling,
]
const SAMPLING_MAP = new Map(SAMPLING_ENTRIES.map(model => [model.label, model]))

const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 256}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 256}),
    Type.number('scale', 'Scale', {default: 20, step: 1, min: 1}),
    Type.number('growth', 'Growth', {default: 10, step: 1, min: 0}),
    Type.number('chance', 'Chance', {default: 0.3, step: 0.01, min: 0.1, max: 1}),
    Type.selection('pointSampling', 'Sampling', {
        default: EvenPointSampling.label,
        options: SAMPLING_ENTRIES
    }),
    Type.text('seed', 'Seed', {default: ''})
)


export default class RegionMap extends BaseMap {
    static label = 'RegionMap'
    static diagram = MapDiagram
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
        const PointSampling = SAMPLING_MAP.get(params.get('pointSampling'))
        const points = PointSampling.create(
            params.get('scale'), this.width, this.height
        )
        this.matrix = this.buildMatrix(points, params)

        // STEP: distance field from borders

    }

    buildMatrix(points, params) {
        const matrix = new RegionMapMatrix(params.get('width'), params.get('height'))
        const multiFill = new OrganicMultiFill(points, fillValue => ({
            chance:   params.get('chance'),
            growth:   params.get('growth'),
            setValue: point => matrix.setValue(point, fillValue),
            isEmpty:  (adjacent, center) => {
                const notEmpty = ! matrix.isEmpty(adjacent)
                const notSameValue = ! matrix.isValue(adjacent, fillValue)
                if (notSameValue && notEmpty) {
                    matrix.setBorder(center)
                }
                return matrix.isEmpty(adjacent)
            },
        }))
        this.fillCount = multiFill.size
        return matrix
    }

    get(point) {
        return this.matrix.get(point)
    }

    isBorder(point) {
        return this.matrix.isBorder(point)
    }
}

