import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { RandomPointSampling, EvenPointSampling } from '/lib/base/point/sampling'
import { Graph } from '/lib/base/graph'
import { UIMap } from '/lib/ui/map'
import { BaseMap } from '/model/lib/map'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'

import { MapDiagram } from './diagram'
import { Region, RegionMapTable, RegionFillConfig } from './region'


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
    static ui = UIMap

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
        const origins = PointSampling.create(width, height, scale)
        const table = new RegionMapTable(width, height)
        const graph = new Graph()
        const organicFills = origins.map((origin, id) => {
            const region = new Region(id, origin)
            const fillConfig = new RegionFillConfig({
                chance: params.get('chance'),
                growth: params.get('growth'),
                table, graph, region
            })
            return new OrganicFloodFill(region.origin, fillConfig)
        })
        new MultiFill(organicFills).fill()

        this.table = table
        this.graph = graph
    }

    getRegion(point) {
        return this.table.getRegion(point)
    }

    getBorderRegion(point) {
        return this.table.getBorderRegion(point)
    }

    getNeighbors(region) {
        const edges = this.graph.getEdges(region.id)
        return edges.map(id => this.table.getRegionById(id))
    }

    isNeighbor(id, neighborId) {
        return this.graph.hasEdge(id, neighborId)
    }

    isBorder(point) {
        return this.table.isBorder(point)
    }

    map(callback) {
        return this.table.map(group => callback(group))
    }

    forEach(callback) {
        this.table.forEach(callback)
    }
}
