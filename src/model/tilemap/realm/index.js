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
    Type.number('realmScale', 'RmScale', {default: 34, step: 1, min: 1, max: 100}),
    Type.number('realmChance', 'RmChance', {default: 0.1, step: 0.1, min: 0.1, max: 1}),
    Type.number('realmGrowth', 'RmGrowth', {default: 25, step: 1, min: 0, max: 100}),
    Type.number('scale', 'Rg scale', {default: 2, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Rg growth', {default: 0, step: 1, min: 0, max: 100}),
    Type.number('chance', 'Rg chance', {default: 0.1, step: 0.1, min: 0.1, max: 1}),
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
            params.get('realmScale')
        )
        this.realmChance = params.get('realmChance')
        this.realmGrowth = params.get('realmGrowth')
        this.borderRegions = new Set()
        this.regionToRealm = new Map()
        this.graph = new Graph()
        this.realms = []
        this.mapFill = this._buildMapFill()
        this.directions = this._buildDirections()
    }

    _buildRegionTileMap(params) {
        const [width, height, seed] = params.get('width', 'height', 'seed')
        const [scale, chance, growth] = params.get('scale', 'chance', 'growth')
        const data = {width, height, scale, seed, chance, growth}
        return RegionTileMap.fromData(data)
    }

    _buildMapFill() {
        const mapFill = []
        const fills = this.origins.map((origin, id) => {
            const region = this.regionTileMap.getRegion(origin)
            const fillConfig = new RealmFillConfig(id, this)
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(fills).map(fill => {
            const id = fill.config.id
            mapFill[id] = fill
            this.realms.push(id)
        })
        return mapFill
    }

    _buildDirections() {
        const directions = new PairMap()
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
        const region = this.getRegion(point)
        const realm = this.getRealm(point)
        const neighbors = this.getNeighborRealms(realm)
        return {
            realm: realm.id,
            region: region.id,
            neighbors: neighbors.map(neighbor => {
                const dir = this.getRealmDirection(realm, neighbor)
                return `${dir.name}(${neighbor.id})`
            }).join(', ')
        }
    }

    getRealm(point) {
        const region = this.getRegion(point)
        return this.getRealmByRegion(region)
    }

    getRealms() {
        return this.realms.map(id => {
            return {
                id,
                origin: this.origins[id],
                area: this.mapFill[id].config.area
            }
        })
    }

    getRegion(point) {
        return this.regionTileMap.getRegion(point)
    }

    getRegions() {
        return this.regionTileMap.getRegions()
    }

    getBorderRegions() {
        return this.regionTileMap.getRegions().filter(region => {
            return this.isBorderRegion(region)
        })
    }

    getNeighborRealms(realm) {
        const edges = this.graph.getEdges(realm.id)
        const realms = this.getRealms()
        return edges.map(id => realms[id])
    }

    getRealmDirection(sourceRealm, targetRealm) {
        return this.directions.get(sourceRealm.id, targetRealm.id)
    }

    getRealmByRegion(region) {
        const id = this.regionToRealm.get(region.id)
        const realms = this.getRealms()
        return realms[id]
    }

    getNeighborRegions(region) {
        return this.regionTileMap.getNeighborRegions(region)
    }

    isBorderRegion(region) {
        return this.borderRegions.has(region.id)
    }

    isRegionBorder(point) {
        return this.regionTileMap.isBorder(point)
    }

    isRealmBorder(point) {
        const neighborRegions = this.regionTileMap.getBorderRegions(point)
        if (neighborRegions.length === 0) return false
        const realm = this.getRealm(point)
        for (let region of neighborRegions) {
            const id = this.regionToRealm.get(region.id)
            if (id !== realm.id) return true
        }
        return false
    }

    getAverageRegionArea() {
        const regions = this.regionTileMap.getRegions()
        return Math.round(this.area / regions.length)
    }

    map(callback) {
        const realms = this.getRealms()
        return realms.map(callback)
    }

    forEach(callback) {
        const realms = this.getRealms()
        realms.forEach(callback)
    }
}


class RealmFillConfig {
    constructor(id, model) {
        this.id = id
        this.area = 0
        this.model = model
        this.chance = model.realmChance
        this.growth = model.realmGrowth
    }

    isEmpty(region) {
        return !this.model.regionToRealm.has(region.id)
    }

    setValue(region) {
        this.model.regionToRealm.set(region.id, this.id)
        this.area += region.area
    }

    checkNeighbor(neighborRegion, region) {
        if (this.isEmpty(neighborRegion)) return
        const neighborRealmId = this.model.regionToRealm.get(neighborRegion.id)
        if (neighborRealmId === this.id) return
        this.model.borderRegions.add(region.id)
        this.model.graph.setEdge(this.id, neighborRealmId)
    }

    getNeighbors(region) {
        return this.model.regionTileMap.getNeighborRegions(region)
    }
}
