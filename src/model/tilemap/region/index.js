import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { Matrix } from '/src/lib/matrix'
import { Graph } from '/src/lib/graph'
import { EvenPointSampling } from '/src/lib/point'
import { PointMap } from '/src/lib/point/map'

import { TileMap } from '/src/model/tilemap/lib'
import { UITileMap } from '/src/ui/tilemap'

import { RegionFloodFill } from './fill'
import { RegionTileMapDiagram } from './diagram'


const EMPTY = null
const SCHEMA = new Schema(
    'RegionTileMap',
    Type.rect('rect', 'Size', {default: '100x100'}),
    Type.number('scale', 'Scale', {default: 10, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 10, step: 1, min: 0, max: 100}),
    Type.number('chance', 'Chance', {default: .1, step: .05, min: 0, max: 1}),
    Type.text('seed', 'Seed', {default: ''}),
)


export class RegionTileMap extends TileMap {
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
    #borderMap = new PointMap()
    #centerPoints
    #regionMatrix
    #growthMatrix
    #levelMatrix
    #regions
    #origins

    constructor(params) {
        super(params)
        const scale = params.get('scale')
        this.#origins = EvenPointSampling.create(this.rect, scale)
        this.#regionMatrix = Matrix.fromRect(this.rect, () => EMPTY)
        this.#growthMatrix = Matrix.fromRect(this.rect, () => 0)
        this.#levelMatrix = Matrix.fromRect(this.rect, () => 0)
        this.#centerPoints = new PointSet(this.#origins)
        this.#regions = this.#origins.map((_, id) => id)
        new RegionFloodFill().start(this.#origins, {
            regionMatrix: this.#regionMatrix,
            growthMatrix: this.#growthMatrix,
            levelMatrix: this.#levelMatrix,
            borderMap: this.#borderMap,
            graph: this.#graph,
            chance: params.get('chance'),
            growth: params.get('growth'),
        })
    }

    get size() {
        return this.#origins.length
    }

    get graph() {
        return this.#graph
    }

    get(point) {
        const region = this.getRegion(point)
        return [
            `clicked: ${Point.hash(point)}`,
            `id: ${region}`,
            `level: ${this.getLevel(point)}`
        ].join(', ')
    }

    getRegion(point) {
        return this.#regionMatrix.get(point)
    }

    getGrowth(point) {
        return this.#growthMatrix.get(point)
    }

    getLevel(point) {
        return this.#levelMatrix.get(point)
    }

    getRegions() {
        return this.#regions
    }

    getOriginById(id) {
        return this.#origins[id]
    }

    getBorderRegions(point) {
        // a single tile can have two different region neighbors
        return Array.from(this.#borderMap.get(point) ?? [])
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
        return this.#borderMap.has(point)
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
        return `Regions: ${this.#regions.length}`
    }
}
