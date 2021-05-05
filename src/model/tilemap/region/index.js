import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { UITileMap } from '/ui/tilemap'
import { TileMap } from '/model/lib/tilemap'

import { RegionTileMapDiagram } from './diagram'
import { RegionMapModel } from './model'


const SCHEMA = new Schema(
    'RegionTileMap',
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 15, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 100, step: 1, min: 0, max: 100}),
    Type.number('chance', 'Chance', {default: 0.2, step: 0.01, min: 0.1, max: 1}),
    Type.text('seed', 'Seed', {default: '1620175014634'})
    // THIS SEED HAS A 1-POINT REGION WITH TWO BORDERS
)


export class RegionTileMap extends TileMap {
    static id = 'RegionTileMap'
    static diagram = RegionTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new RegionTileMap(params)
    }

    static fromData(data) {
        const map = new Map(Object.entries(data))
        const params = RegionTileMap.schema.parse(map)
        return new RegionTileMap(params)
    }

    constructor(params) {
        super(params)
        const model = new RegionMapModel(params)
        this.regions = model.regions
        this.regionMatrix = model.regionMatrix
        this.borderMatrix = model.borderMatrix
        this.graph = model.graph
    }

    get(point) {
        const borderIds = this.getTileBorderRegions(point)
        const region = this.getRegion(point)
        return {
            id: region.id,
            region: region,
            borders: borderIds.map(r => r.id).join(', '),
            neighborRegions: this.getNeighborRegions(region),
        }
    }

    getRegion(point) {
        const id = this.regionMatrix.get(point)
        return this.regions[id]
    }

    getTileBorderRegions(point) {
        // a tile can have two different region neighbor points (Set)
        const ids = Array.from(this.borderMatrix.get(point))
        return ids.map(id => this.regions[id])
    }

    getNeighborRegions(region) {
        const edges = this.graph.getEdges(region.id)
        return edges.map(id => this.regions[id])
    }

    isNeighbor(id, neighborId) {
        return this.graph.hasEdge(id, neighborId)
    }

    isBorder(point) {
        return this.borderMatrix.get(point).size > 0
    }

    map(callback) {
        return this.regions.map(region => callback(region))
    }

    forEach(callback) {
        this.regions.forEach(callback)
    }
}
