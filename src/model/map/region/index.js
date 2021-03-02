import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Matrix } from '/lib/base/matrix'
import { RandomPointSampling, EvenPointSampling } from '/lib/base/point/sampling'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'
import { MapUI } from '/lib/ui/map'
import { BaseMap } from '/model/lib/map'

import { MapDiagram } from './diagram'
import { Regions } from './region'

const NO_REGION = null
const NO_BORDER = null
const SAMPLING_ENTRIES = [
    RandomPointSampling,
    EvenPointSampling,
]
const SAMPLING_MAP = new Map(SAMPLING_ENTRIES.map(model => [model.id, model]))

const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 256}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 256}),
    Type.number('scale', 'Scale', {default: 10, step: 1, min: 1}),
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

        this.regionMatrix = new Matrix(width, height, () => NO_REGION)
        this.borderMatrix = new Matrix(width, height, () => NO_BORDER)
        // regions.setNeighborhood(region.id, neighborValue)
        this.regions = new Regions(origins)
        new RegionMapFill(this.regions, this.regionMatrix, this.borderMatrix, params)
    }

    getValue(point) {
        return this.regionMatrix.get(point)
    }

    isNeighborhood(point, neighborValue) {
        const currentValue = this.getValue(point)
        return this.regions.isNeighborhood(currentValue, neighborValue)
    }

    isBorder(point) {
        return this.borderMatrix.get(point) !== NO_BORDER
    }

    getBorder(point) {
        return this.borderMatrix.get(point)
    }
}


// make this dict a FloodFillParams class with {origin: ,...}
class RegionMapFill {
    constructor(regions, regionMatrix, borderMatrix, params) {
        function buildParams(region) {
            return {
                chance:   params.get('chance'),
                growth:   params.get('growth'),
                isEmpty:  point => regionMatrix.get(point) === NO_REGION,
                setValue: point => regionMatrix.set(point, region.id),
                checkNeighbor: (neighbor, origin) => {
                    const neighborRegion = regionMatrix.get(neighbor)
                    if (neighborRegion === NO_REGION) return
                    if (neighborRegion === region.id) return
                    borderMatrix.set(origin, neighborRegion)
                }
            }
        }
        const fills = regions.map(region => {
            return new OrganicFloodFill(region.origin, buildParams(region))
        })
        new MultiFill(fills)
    }
}
