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
    Type.text('seed', 'Seed', {default: 'a'})
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
        this.model = new RegionMapModel(params)
    }

    get(point) {
        const borderIds = this.model.getTileBorderRegions(point)
        const region = this.model.getRegion(point)
        return {
            id: region.id,
            region: region,
            borders: borderIds.map(r => r.id).join(', '),
            neighborRegions: this.getNeighborRegions(region),
        }
    }

    getRegion(point) {
        return this.model.getRegion(point)
    }

    getRegionById(id) {
        return this.model.getRegionById(id)
    }

    getTileBorderRegions(point) {
        return this.model.getTileBorderRegions(point)
    }

    getNeighborRegions(region) {
        const edges = this.model.graph.getEdges(region.id)
        return edges.map(id => this.model.getRegionById(id))
    }

    isNeighbor(id, neighborId) {
        return this.model.isNeighbor(id, neighborId)
    }

    isBorder(point) {
        return this.model.isBorder(point)
    }

    map(callback) {
        return this.model.map(region => callback(region))
    }

    forEach(callback) {
        this.model.forEach(callback)
    }
}
