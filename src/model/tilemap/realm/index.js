import { PairMap } from '/lib/map'
import { Direction } from '/lib/direction'
import { Point } from '/lib/point'
import { Graph } from '/lib/graph'

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
    Type.number('chance', 'Chance', {default: .1, step: .1, min: .1, max: 1}),
    Type.number('growth', 'Growth', {default: 25, step: 1, min: 0, max: 100}),
    Type.number('rgScale', 'RgScale', {default: 2, step: 1, min: 1, max: 100}),
    Type.number('rgGrowth', 'RgGrowth', {default: 0, step: 1, min: 0, max: 100}),
    Type.number('rgChance', 'RgChance', {default: .1, step: .1, min: .1, max: 1}),
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
        let t0 = performance.now()
        this.regionTileMap = this._buildRegionTileMap(params)
        this.origins = RealmPointSampling.create(
            this.regionTileMap,
            params.get('scale')
        )
        this.borderRegions = new Set()
        this.regionToRealm = new Map()
        this.graph = new Graph()
        this.realms = this.origins.map((_, id) => id)
        this.mapFill = new RealmMultiFill(this, params)
        this.mapFill.fill()
        this.directions = this._buildDirections()
        this._borderRegions = this._buildBorderRegions()
        console.log(`RealmTileMap: ${Math.round(performance.now() - t0)}ms`);
    }

    _buildRegionTileMap(params) {
        const [width, height, seed] = params.get('width', 'height', 'seed')
        const [scale, chance, growth] = params.get(
            'rgScale', 'rgChance', 'rgGrowth')
        const data = {width, height, scale, seed, chance, growth}
        return RegionTileMap.fromData(data)
    }

    _buildBorderRegions() {
        return this.regionTileMap.regions.filter(regionId => {
            return this.isBorderRegion(regionId)
        })
    }

    _buildDirections() {
        const directions = new PairMap()
        for(let id=0; id<this.origins.length; id++) {
            const origin = this.origins[id]
            const neighbors = this.graph.getEdges(id)
            for(let neighborId of neighbors) {
                const neighborOrigin = this.origins[neighborId]
                const sideOrigin = this.rect.wrapVector(origin, neighborOrigin)
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

    get size() {
        return this.origins.length
    }

    getRealm(point) {
        const regionId = this.getRegion(point)
        return this.getRealmByRegion(regionId)
    }

    getRealms() {
        return this.realms
    }

    getRealmOrigin(point) {
        const id = this.getRealm(point)
        return this.origins[id]
    }

    getRealmOriginById(id) {
        return this.origins[id]
    }

    getRealmAreaById(id) {
        return this.mapFill.getArea(id)
    }

    getRealmsDescOrder() {
        const cmpDescendingArea = (id0, id1) => {
            const area0 = this.mapFill.getArea(id0)
            const area1 = this.mapFill.getArea(id1)
            return area1 - area0
        }
        return this.realms.sort(cmpDescendingArea)
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

    getRegion(point) {
        return this.regionTileMap.getRegion(point)
    }

    getRegions() {
        return this.regionTileMap.getRegions()
    }

    getRegionOrigin(point) {
        return this.regionTileMap.getRegionOrigin(point)
    }

    getBorderRegions() {
        return this._borderRegions
    }

    getSideRegions(regionId) {
        return this.regionTileMap.getSideRegions(regionId)
    }

    isBorderRegion(regionId) {
        return this.borderRegions.has(regionId)
    }

    isRegionBorder(point) {
        return this.regionTileMap.isBorder(point)
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
