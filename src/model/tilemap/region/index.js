import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { Matrix } from '/src/lib/matrix'
import { Graph } from '/src/lib/graph'
import { EvenPointSampling } from '/src/lib/point/sampling'
import { PairMap } from '/src/lib/map'

import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { RegionMultiFill } from './fill'
import { RegionTileMapDiagram } from './diagram'


const NO_REGION = null
const SCHEMA = new Schema(
    'RegionTileMap',
    Type.rect('rect', 'Size', {default: '150x100'}),
    Type.number('scale', 'Scale', {default: 10, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 10, step: 1, min: 0, max: 100}),
    Type.number('chance', 'Chance', {default: .1, step: .05, min: 0, max: 1}),
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
    #borderMap = new PairMap()
    #centerPoints
    #regionMatrix
    #regions
    #origins
    #mapFill


    constructor(params) {
        super(params)
        const scale = params.get('scale')
        this.#origins = EvenPointSampling.create(this.rect, scale)
        this.#regionMatrix = Matrix.fromRect(this.rect, () => NO_REGION)
        this.#centerPoints = new PointSet(this.#origins)
        this.#regions = this.#origins.map((_, id) => id)
        this.#mapFill = new RegionMultiFill(this.#origins, {
            regionMatrix: this.#regionMatrix,
            borderMap: this.#borderMap,
            graph: this.#graph,
            chance: params.get('chance'),
            growth: params.get('growth'),
        })
        this.#mapFill.fill()
    }

    get size() {
        return this.#origins.length
    }

    get graph() {
        return this.#graph
    }

    get(point) {
        const region = this.getRegion(point)
        const regionArea = this.getArea(region)
        const regionOrigin = this.getRegionOrigin(point)
        return [
            `clicked: ${Point.hash(point)}`,
            `id: ${region}`,
            `area: ${regionArea}`,
            `origin: ${Point.hash(regionOrigin)}`,
        ].join(', ')
    }

    getRegion(point) {
        return this.#regionMatrix.get(point)
    }

    getRegions() {
        return this.#regions
    }

    getRegionOrigin(point) {
        const id = this.#regionMatrix.get(point)
        return this.#origins[id]
    }

    getOriginById(id) {
        return this.#origins[id]
    }

    getArea(id) {
        return this.#mapFill.getArea(id)
    }

    getBorderRegions(point) {
        // a single tile can have two different region neighbors
        return Array.from(this.#borderMap.get(...point) ?? [])
    }

    getBorders() {
        return this.#borderMap.getPairs()
    }

    getSideRegions(regionId) {
        return this.#graph.getEdges(regionId)
    }

    distanceBetween(region0, region1) {
        const point0 = this.getOriginById(region0)
        const point1 = this.getOriginById(region1)
        const unwrappedPoint1 = this.#regionMatrix.rect.unwrapFrom(point0, point1)
        return Point.distance(point0, unwrappedPoint1)
    }

    isOrigin(point) {
        return this.#centerPoints.has(point)
    }

    isNeighbor(regionId, neighborId) {
        return this.#graph.hasEdge(regionId, neighborId)
    }

    isBorder(point) {
        return this.#borderMap.has(...point)
    }

    map(callback) {
        return this.#regions.map(callback)
    }

    forEachBorderPoint(callback) {
        this.#borderMap.forEach(callback)
    }

    forEach(callback) {
        this.#regions.forEach(callback)
    }

    getDescription() {
        return `Regions: ${this.#regions.length}, Area: ${this.area}`
    }
}
