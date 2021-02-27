import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Graph } from '/lib/base/graph'
import { Matrix } from '/lib/base/matrix'
import { RandomPointSampling, EvenPointSampling } from '/lib/base/point/sampling'
import { OrganicMultiFill } from '/lib/floodfill/organic'
import { MapUI } from '/lib/ui/map'
import { BaseMap } from '/model/lib/map'

import { MapDiagram } from './diagram'
import { RegionCell } from './region'


const SAMPLING_ENTRIES = [
    RandomPointSampling,
    EvenPointSampling,
]
const SAMPLING_MAP = new Map(SAMPLING_ENTRIES.map(model => [model.id, model]))

const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 256}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 256}),
    Type.number('scale', 'Scale', {default: 28, step: 1, min: 1}),
    Type.number('growth', 'Growth', {default: 20, step: 1, min: 0}),
    Type.number('chance', 'Chance', {default: 0.3, step: 0.01, min: 0.1, max: 1}),
    Type.selection('pointSampling', 'Sampling', {
        default: EvenPointSampling.id,
        options: SAMPLING_ENTRIES
    }),
    Type.text('seed', 'Seed', {default: ''})
)


export default class RegionMap extends BaseMap {
    static id = 'RegionMap'
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
        this.matrix = new Matrix(this.width, this.height, () => new RegionCell())
        this.regions = new Regions(this.matrix, params)
        this.regionCount = this.regions.count
        // next: distance field from borders
    }

    get(point) {
        return this.matrix.get(point)
    }

    getValue(point) {
        return this.matrix.get(point).getValue()
    }

    isBorder(point) {
        return this.matrix.get(point).isBorder()
    }

    getBorder(point) {
        return this.matrix.get(point).getBorder()
    }
}


class Regions {
    constructor(matrix, params) {
        const PointSampling = SAMPLING_MAP.get(params.get('pointSampling'))
        const points = PointSampling.create(
            params.get('scale'), params.get('width'), params.get('height')
        )

        this.graph = new Graph()
        const multiFill = new OrganicMultiFill(points, fillValue => ({
            chance:   params.get('chance'),
            growth:   params.get('growth'),
            setValue: point => matrix.get(point).setValue(fillValue),
            isEmpty:  point => matrix.get(point).isEmpty(),
            checkNeighbor: (neighbor, origin) => {
                const neighborCell = matrix.get(neighbor)
                const notEmpty = ! neighborCell.isEmpty()
                const notSameValue = ! neighborCell.isValue(fillValue)
                // is another fill
                if (notSameValue && notEmpty) {
                    const neighborValue = neighborCell.getValue()
                    matrix.get(origin).setBorder(neighborValue)
                    this.graph.addEdge(fillValue, neighborValue)
                }
            },
        }))
        this.count = multiFill.size
    }
}