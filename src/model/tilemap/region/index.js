import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Point } from '/lib/base/point'
import { UITileMap } from '/ui/tilemap'
import { TileMap } from '/lib/model/tilemap'

import { RegionTileMapDiagram } from './diagram'
import { RegionMapModel } from './model'


const SCHEMA = new Schema(
    'RegionTileMap',
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 10, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 10, step: 1, min: 0, max: 100}),
    Type.number('chance', 'Chance', {default: 0.1, step: 0.01, min: 0.1, max: 1}),
    Type.text('seed', 'Seed', {default: ''})
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
        const params = RegionTileMap.schema.buildFrom(map)
        return new RegionTileMap(params)
    }

    constructor(params) {
        super(params)
        const model = new RegionMapModel(params)
        this.origins = model.origins
        this.regionMatrix = model.regionMatrix
        this.levelMatrix = model.levelMatrix
        this.borderMatrix = model.borderMatrix
        this.areaTable = model.areaTable
        this.graph = model.graph
    }

    get(point) {
        const region = this.getRegion(point)
        const neighbors = this.getNeighborRegions(region)
        return {
            point: Point.hash(point),
            id: region.id,
            region: region,
            neighbors: neighbors.map(neighbor => {
                const dir = this.getRegionDirection(region, neighbor)
                return `${dir.name}(${neighbor.id})`
            }).join(', ')
        }
    }

    getRegion(point) {
        const id = this.regionMatrix.get(point)
        if (! this.getRegionById(id)) {
            console.log(id);
        }
        return this.getRegionById(id)
    }

    getRegionById(id) {
        return {
            id,
            origin: this.origins[id],
            area: this.areaTable[id]
        }
    }

    getRegions() {
        const regions = []
        for(let id=0; id<this.origins.length; id++) {
            regions.push(this.getRegionById(id))
        }
        return regions
    }

    getLevel(point) {
        return this.levelMatrix.get(point)
    }

    getBorderRegions(point) {
        // a single tile can have two different region neighbors
        const ids = Array.from(this.borderMatrix.get(point))
        return ids.map(id => this.getRegionById(id))
    }

    getNeighborRegions(region) {
        const edges = this.graph.getEdges(region.id)
        return edges.map(id => this.getRegionById(id))
    }

    isNeighbor(id, neighborId) {
        return this.graph.hasEdge(id, neighborId)
    }

    isBorder(point) {
        return this.borderMatrix.get(point).size > 0
    }

    map(callback) {
        return this.getRegions().map(callback)
    }

    forEach(callback) {
        this.getRegions().forEach(callback)
    }
}
