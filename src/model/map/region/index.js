import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { RandomPointSampling, EvenPointSampling } from '/lib/base/point/sampling'
import { Graph } from '/lib/base/graph'
import { MapUI } from '/lib/ui/map'
import { BaseMap } from '/model/lib/map'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'

import { MapDiagram } from './diagram'
import { Region, RegionMatrix, RegionFillConfig } from './region'


const SAMPLING_ENTRIES = [RandomPointSampling, EvenPointSampling]
const SAMPLING_MAP = new Map(SAMPLING_ENTRIES.map(model => [model.id, model]))

const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 256}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 256}),
    Type.number('scale', 'Scale', {default: 20, step: 1, min: 1}),
    Type.number('growth', 'Growth', {default: 25, step: 1, min: 0}),
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
        this.origins = PointSampling.create(width, height, scale)
        this.matrix = new RegionMatrix(width, height)
        this.adjacency = new Graph()
        this.regionIndex = {}
        this.regions = []

        const organicFills = this.origins.map((origin, id) => {
            const region = new Region(id, origin)
            const refs = {matrix: this.matrix, adjacency: this.adjacency, region}
            const fillConfig = new RegionFillConfig(refs, params)
            this.regionIndex[region.id] = region
            this.regions.push(region)
            return new OrganicFloodFill(region.origin, fillConfig)
        })
        new MultiFill(organicFills).fill()
    }

    getRegion(point) {
        const id = this.matrix.getRegionId(point)
        return this.regionIndex[id]
    }

    getBorderRegion(point) {
        const id = this.matrix.getBorderId(point)
        return this.regionIndex[id]
    }

    getBorderRegions() {
        return []
    }

    isBorder(point) {
        return this.matrix.isBorder(point)
    }

    map(callback) {
        return this.regions.map(callback)
    }
}
