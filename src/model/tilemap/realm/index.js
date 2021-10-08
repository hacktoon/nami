import { PairMap } from '/lib/map'
import { Direction } from '/lib/direction'
import { Point } from '/lib/point'
import { Graph } from '/lib/graph'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'

import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'

import { RegionTileMap } from '/model/tilemap/region'

import { RealmPointSampling } from './sampling'
import { RealmTileMapDiagram } from './diagram'
import { RealmMultiFill } from './fill'


const ID = 'RealmTileMap'
const SCHEMA = new Schema(
    ID,
    Type.number('width', 'W', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'H', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 34, step: 1, min: 1, max: 100}),
    Type.number('chance', 'Chance', {default: 0.1, step: 0.1, min: 0.1, max: 1}),
    Type.number('growth', 'Growth', {default: 25, step: 1, min: 0, max: 100}),
    Type.number('rgScale', 'RgScale', {default: 2, step: 1, min: 1, max: 100}),
    Type.number('rgGrowth', 'RgGrowth', {default: 0, step: 1, min: 0, max: 100}),
    Type.number('rgChance', 'RgChance', {default: 0.1, step: 0.1, min: 0.1, max: 1}),
    Type.text('seed', 'Seed', {default: ''})
)


export class RealmTileMap extends TileMap {
    static id = ID
    static diagram = RealmTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static fromData(data) {
        const map = new Map(Object.entries(data))
        const params = RealmTileMap.schema.buildFrom(map)
        return new RealmTileMap(params)
    }

    static create(params) {
        return new RealmTileMap(params)
    }

    constructor(params) {
        super(params)
        this.regionTileMap = this._buildRegionTileMap(params)
        this.origins = RealmPointSampling.create(
            this.regionTileMap,
            params.get('scale')
        )
        this.chance = params.get('chance')
        this.growth = params.get('growth')
        this.borderRegions = new Set()
        this.regionToRealm = new Map()
        this.graph = new Graph()
        this.realms = this.origins.map((_, id) => id)
        this.mapFill = this._buildMapFill()
        this.directions = this._buildDirections()
    }

    _buildRegionTileMap(params) {
        const [width, height, seed] = params.get('width', 'height', 'seed')
        const [scale, chance, growth] = params.get(
            'rgScale', 'rgChance', 'rgGrowth')
        const data = {width, height, scale, seed, chance, growth}
        return RegionTileMap.fromData(data)
    }

    _buildMapFill() {
        const mapFill = []
        const fills = this.origins.map((origin, id) => {
            const regionId = this.regionTileMap.getRegion(origin)
            const fillConfig = new RealmFillConfig(id, this)
            return new OrganicFloodFill(regionId, fillConfig)
        })
        new MultiFill(fills).map(fill => {
            mapFill[fill.config.id] = fill
        })
        return mapFill
    }

    _buildDirections() {
        const directions = new PairMap()
        // TODO: remove this dependency
        const matrix = this.regionTileMap.regionMatrix
        for(let id=0; id<this.origins.length; id++) {
            const origin = this.origins[id]
            const neighbors = this.graph.getEdges(id)
            for(let neighborId of neighbors) {
                const neighborOrigin = this.origins[neighborId]
                const sideOrigin = matrix.wrapVector(origin, neighborOrigin)
                const angle = Point.angle(origin, sideOrigin)
                const direction = Direction.fromAngle(angle)
                directions.set(id, neighborId, direction)
            }
        }
        return directions
    }

    get(point) {
        const regionId = this.getRegion(point)
        const realmId = this.getRealm(point)
        const neighbors = this.getNeighborRealms(realmId)
        return {
            realm: realmId,
            region: regionId,
            neighbors: neighbors.map(neighborId => {
                const dir = this.getRealmDirection(realmId, neighborId)
                return `${dir.name}(${neighborId})`
            }).join(', ')
        }
    }

    getRealm(point) {
        const regionId = this.getRegion(point)
        return this.getRealmByRegion(regionId)
    }

    getRealmOrigin(point) {
        const id = this.getRealm(point)
        return this.origins[id]
    }

    getRealmOriginById(id) {
        return this.origins[id]
    }

    getRealmAreaById(id) {
        return this.mapFill[id].config.area
    }

    getRealms() {
        return this.realms
    }

    getRealmsDescOrder() {
        const cmpDescendingArea = (id0, id1) => {
            const area0 = this.mapFill[id0].config.area
            const area1 = this.mapFill[id1].config.area
            return area1 - area0
        }
        return this.realms.sort(cmpDescendingArea)
    }

    getRegion(point) {
        return this.regionTileMap.getRegion(point)
    }

    getRegionOrigin(point) {
        return this.regionTileMap.getRegionOrigin(point)
    }

    getRegions() {
        return this.regionTileMap.getRegions()
    }

    getBorderRegions() {
        return this.regionTileMap.regions.filter(regionId => {
            return this.isBorderRegion(regionId)
        })
    }

    getNeighborRealms(realmId) {
        return this.graph.getEdges(realmId)
    }

    getRealmDirection(sourceRealmId, targetRealmId) {
        return this.directions.get(sourceRealmId, targetRealmId)
    }

    getRealmByRegion(regionId) {
        return this.regionToRealm.get(regionId)
    }

    getNeighborRegions(regionId) {
        return this.regionTileMap.getNeighborRegions(regionId)
    }

    isBorderRegion(regionId) {
        return this.borderRegions.has(regionId)
    }

    isRegionBorder(point) {
        return this.regionTileMap.isBorder(point)
    }

    isRealmBorder(point) {
        const neighborRegionIds = this.regionTileMap.getBorderRegions(point)
        if (neighborRegionIds.length === 0) return false
        const realmId = this.getRealm(point)
        for (let regionId of neighborRegionIds) {
            const id = this.regionToRealm.get(regionId)
            if (id !== realmId) return true
        }
        return false
    }

    getAverageRegionArea() {
        return Math.round(this.area / this.regionTileMap.size)
    }

    map(callback) {
        return this.realms.map(callback)
    }

    forEach(callback) {
        this.realms.forEach(callback)
    }
}


class RealmFillConfig {
    constructor(id, model) {
        this.id = id
        this.area = 0
        this.model = model
        this.chance = model.chance
        this.growth = model.growth
    }

    isEmpty(regionId) {
        return !this.model.regionToRealm.has(regionId)
    }

    setValue(regionId) {
        this.model.regionToRealm.set(regionId, this.id)
        this.area += this.model.regionTileMap.getRegionAreaById(regionId)
    }

    checkNeighbor(neighborRegionId, regionId) {
        if (this.isEmpty(neighborRegionId)) return
        const neighborRealmId = this.model.regionToRealm.get(neighborRegionId)
        if (neighborRealmId === this.id) return
        this.model.borderRegions.add(regionId)
        this.model.graph.setEdge(this.id, neighborRealmId)
    }

    getNeighbors(regionId) {
        return this.model.regionTileMap.getNeighborRegions(regionId)
    }
}
