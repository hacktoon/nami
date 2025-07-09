import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/geometry/point'
import { PointSet } from '/src/lib/geometry/point/set'
import { Grid } from '/src/lib/grid'
import { Color } from '/src/lib/color'
import { Graph } from '/src/lib/graph'
import { EvenPointSampling } from '/src/lib/geometry/point/sampling'
import { PointMap } from '/src/lib/geometry/point/map'

import { TileMap } from '/src/model/tilemap/lib'
import { UITileMap } from '/src/ui/tilemap'

import { RegionFloodFill } from './fill'
import { RegionTileMapDiagram } from './diagram'


const EMPTY = null
const SCHEMA = new Schema(
    'RegionTileMap',
    Type.number('size', 'Size', {default: 100, min: 9, max: 200}),
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
    #colorMap = new Map()
    #borderMap
    #centerPoints
    #regionGrid
    #levelGrid
    #regions
    #origins

    constructor(params) {
        super(params)
        const fillMap = new Map()
        const scale = params.get('scale')
        this.#origins = EvenPointSampling.create(this.rect, scale)
        this.#regionGrid = Grid.fromRect(this.rect, () => EMPTY)
        this.#levelGrid = Grid.fromRect(this.rect, () => 0)
        this.#centerPoints = new PointSet(this.rect, this.#origins)
        this.#borderMap = new PointMap(this.rect)
        this.#regions = this.#origins.map((origin, id) => {
            fillMap.set(id, {origin})
            return id
        })
        new RegionFloodFill(fillMap, {
            regionGrid: this.#regionGrid,
            colorMap: this.#colorMap,
            levelGrid: this.#levelGrid,
            borderMap: this.#borderMap,
            graph: this.#graph,
            chance: params.get('chance'),
            growth: params.get('growth'),
        }).complete()
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

    getColor(point, showBorder) {
        const id = this.getRegion(point)
        if (! this.#colorMap.has(id)) {
            return Color.WHITE
        }
        const color = this.#colorMap.get(id)
        if (showBorder && this.isBorder(point)) {
            // if (this.showNeighborBorder) {
            //     const neighborRegions = this.getBorderRegions(point)
            //     return this.getColor(neighborRegions)
            // }
            return color.darken(40)
        }
        return color
    }

    getRegion(point) {
        return this.#regionGrid.get(point)
    }

    getLevel(point) {
        return this.#levelGrid.get(point)
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
