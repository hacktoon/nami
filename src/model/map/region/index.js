import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Graph } from '/lib/base/graph'
import { Matrix } from '/lib/base/matrix'
import { RandomPointSampling, EvenPointSampling } from '/lib/base/point/sampling'
import { OrganicMultiFill } from '/lib/floodfill/organic'
import { MapUI } from '/lib/ui/map'
import { BaseMap } from '/model/lib/map'

import { MapDiagram } from './diagram'
import { Region, RegionCell } from './region'


const SAMPLING_ENTRIES = [
    RandomPointSampling,
    EvenPointSampling,
]
const SAMPLING_MAP = new Map(SAMPLING_ENTRIES.map(model => [model.id, model]))

const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 256}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 256}),
    Type.number('scale', 'Scale', {default: 30, step: 1, min: 1}),
    Type.number('growth', 'Growth', {default: 30, step: 1, min: 0}),
    Type.number('chance', 'Chance', {default: 0.2, step: 0.01, min: 0.1, max: 1}),
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
        const [scale, width, height] = params.get('scale', 'width', 'height')
        const PointSampling = SAMPLING_MAP.get(params.get('pointSampling'))
        const origins = PointSampling.create(scale, width, height)
        this.matrix = new Matrix(width, height, () => new RegionCell())
        this.regions = new Regions(origins)
        new RegionMapFill(this.regions, this.matrix, params)
        // next: distance field from borders
    }

    getRegion(point) {
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
    constructor(origins) {
        this.regions = origins.map((_, id) => new Region(id))
        this.graph = new Graph()
        this.origins = origins
    }

    forEach(callback) {
        this.regions.forEach(region => callback(region))
    }

    get length() {
        return this.origins.length
    }
}


class RegionMapFill {
    constructor(regions, matrix, params) {
        function buildParams(regionValue) {
            return {
                chance:   params.get('chance'),
                growth:   params.get('growth'),
                isEmpty:  point => matrix.get(point).isEmpty(),
                setValue: point => matrix.get(point).setValue(regionValue),
                checkNeighbor: (neighbor, origin) => {
                    const neighborCell = matrix.get(neighbor)
                    const isEmpty = neighborCell.isEmpty()
                    const sameValue = neighborCell.isValue(regionValue)
                    if (sameValue || isEmpty) return
                    const neighborValue = neighborCell.getValue()
                    matrix.get(origin).setBorder(neighborValue)
                    regions.graph.setEdge(regionValue, neighborValue)
                }
            }
        }
        new OrganicMultiFill(regions.origins, buildParams)
    }
}