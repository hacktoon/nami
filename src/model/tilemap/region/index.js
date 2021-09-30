import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Point } from '/lib/point'
import { Matrix } from '/lib/matrix'
import { Graph } from '/lib/graph'
import { EvenPointSampling, PoissonDiscSampling } from '/lib/point/sampling'

import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'

import { RegionMultiFill } from './fill'
import { RegionTileMapDiagram } from './diagram'


const NO_REGION = null
const SCHEMA = new Schema(
    'RegionTileMap',
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 10, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 10, step: 1, min: 0, max: 100}),
    Type.number('chance', 'Chance', {default: 0.1, step: 0.01, min: 0.1, max: 1}),
    Type.text('seed', 'Seed', {default: ''}),
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
        const [width, height, scale] = params.get('width', 'height', 'scale')
        this.origins = EvenPointSampling.create(width, height, scale)
        // this.origins = PoissonDiscSampling.create(width, height, scale)
        this.regionMatrix = new Matrix(width, height, () => NO_REGION)
        this.levelMatrix = new Matrix(width, height, () => 0)
        this.borderMatrix = new Matrix(width, height, () => new Set())
        this.chance = params.get('chance')
        this.growth = params.get('growth')
        this.graph = new Graph()
        this.mapFill = new RegionMultiFill(this.origins, this)
    }

    get(point) {
        const region = this.getRegion(point)
        return [
            `clicked: ${Point.hash(point)}`,
            `id: ${region.id}`,
            `area: ${region.area}`,
            `origin: ${Point.hash(region.origin)}`,
        ].join(', ')
    }

    getRegion(point) {
        const id = this.regionMatrix.get(point)
        if (! this.getRegionById(id)) {
            console.error(`region ${id} not found`);
        }
        return this.getRegionById(id)
    }

    getRegionId(point) {
        return this.regionMatrix.get(point)
    }

    getRegionOrigin(point) {
        const id = this.regionMatrix.get(point)
        return this.origins[id]
    }

    getRegionById(id) {
        return {
            id,
            origin: this.origins[id],
            area: this.mapFill.getArea(id)
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
