import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Point } from '/lib/point'
import { Matrix } from '/lib/matrix'
import { Graph } from '/lib/graph'
import { EvenPointSampling } from '/lib/point/sampling'
import { PairMap } from '/lib/map'

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

    #graph = new Graph()
    #regions

    constructor(params) {
        super(params)
        let t0 = performance.now()
        const [width, height, scale] = params.get('width', 'height', 'scale')
        this.origins = EvenPointSampling.create(width, height, scale)
        this.regionMatrix = new Matrix(width, height, () => NO_REGION)
        this.levelMatrix = new Matrix(width, height, () => 0)
        this.borderMap = new PairMap()
        this.#regions = this.origins.map((_, id) => id)
        this.mapFill = new RegionMultiFill(this, params)
        this.mapFill.fill()
        console.log(`RegionTileMap: ${Math.round(performance.now() - t0)}ms`);
    }

    get size() {
        return this.origins.length
    }

    get graph() {
        return this.#graph
    }

    get(point) {
        const regionId = this.getRegion(point)
        const regionArea = this.getRegionArea(point)
        const regionOrigin = this.getRegionOrigin(point)
        return [
            `clicked: ${Point.hash(point)}`,
            `id: ${regionId}`,
            `area: ${regionArea}`,
            `origin: ${Point.hash(regionOrigin)}`,
        ].join(', ')
    }

    getRegion(point) {
        return this.regionMatrix.get(point)
    }

    getRegions() {
        return this.#regions
    }

    getRegionOrigin(point) {
        const id = this.regionMatrix.get(point)
        return this.origins[id]
    }

    getOriginById(id) {
        return this.origins[id]
    }

    getRegionArea(point) {
        const id = this.regionMatrix.get(point)
        return this.mapFill.getArea(id)
    }

    getRegionAreaById(id) {
        return this.mapFill.getArea(id)
    }

    getLevel(point) {
        return this.levelMatrix.get(point)
    }

    getBorderRegions(point) {
        // a single tile can have two different region neighbors
        return Array.from(this.borderMap.get(...point) ?? [])
    }

    getSideRegions(regionId) {
        return this.#graph.getEdges(regionId)
    }

    distanceBetween(region0, region1) {
        const point0 = this.getOriginById(region0)
        const point1 = this.getOriginById(region1)
        const unwrappedPoint1 = this.regionMatrix.rect.unwrapFrom(point0, point1)
        return Point.distance(point0, unwrappedPoint1)
    }

    isNeighbor(regionId, neighborId) {
        return this.#graph.hasEdge(regionId, neighborId)
    }

    isBorder(point) {
        return this.borderMap.has(...point)
    }

    map(callback) {
        return this.#regions.map(callback)
    }

    forEach(callback) {
        this.#regions.forEach(callback)
    }
}
