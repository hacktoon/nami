import { PairMap } from '/lib/map'
import { Direction } from '/lib/direction'
import { Point } from '/lib/point'
import { Graph } from '/lib/graph'
import { EvenPointSampling, EvenRealmOriginSampling } from '/lib/point/sampling'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'

import { RegionTileMap } from '/model/tilemap/region'

import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'

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
        const realmScale = params.get('realmScale')
        const [width, height, seed] = params.get('width', 'height', 'seed')
        this.regionTileMap = this._buildRegionTileMap(seed, params)
        const regionOrigins = this.regionTileMap.getRegions()
                              .map(regions => regions.origin)
        const origins = EvenRealmOriginSampling.create(width, height, regionOrigins, realmScale)
        this.realmChance = params.get('realmChance')
        this.realmGrowth = params.get('realmGrowth')
        this.borderRegions = new Set()
        this.regionToGroup = new Map()
        this.graph = new Graph()
        this.realms = this._buildGroups(origins)
        this.directions = this._buildDirections(this.realms)
    }

    _buildRegionTileMap(seed, params) {
        const [width, height] = params.get('width', 'height')
        const [scale, chance, growth] = params.get('scale', 'chance', 'growth')
        const data = {width, height, scale, seed, chance, growth}
        return RegionTileMap.fromData(data)
    }

    _buildGroups(origins) {
        const realms = []
        const fills = origins.map((origin, id) => {
            const region = this.regionTileMap.getRegion(origin)
            const fillConfig = new RealmFillConfig(id, this)
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(fills).map(fill => {
            const origin = fill.origin.origin // TODO: fix this
            const realm = new Realm(
                fill.config.id, origin, fill.config.area
            )
            realms.push(realm)
        })
        return realms
    }

    _buildDirections(realms) {
        const directions = new PairMap()
        const matrix = this.regionTileMap.regionMatrix
        for(let realm of realms) {
            this.graph.getEdges(realm.id).forEach(neighborId => {
                const neighbor = realms[neighborId]
                const sideOrigin = matrix.wrapVector(realm.origin, neighbor.origin)
                const angle = Point.angle(realm.origin, sideOrigin)
                const direction = Direction.fromAngle(angle)
                directions.set(realm.id, neighborId, direction)
            })
        }
        return directions
    }

    get(point) {
        const region = this.getRegion(point)
        const realm = this.getGroup(point)
        const neighbors = this.getNeighborRealms(realm)
        return {
            realm: realm.id,
            region: region.id,
            neighbors: neighbors.map(neighbor => {
                const dir = this.getGroupDirection(realm, neighbor)
                return `${dir.name}(${neighbor.id})`
            }).join(', ')
        }
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

    getRegionDirection(sourceRegion, targetRegion) {
        return this.regionTileMap.getRegionDirection(sourceRegion, targetRegion)
    }

    getGroup(point) {
        const region = this.getRegion(point)
        return this.getRealmByRegion(region)
    }

    getNeighborRealms(realm) {
        const edges = this.graph.getEdges(realm.id)
        return edges.map(id => this.realms[id])
    }

    getGroupDirection(sourceGroup, targetGroup) {
        return this.directions.get(sourceGroup.id, targetGroup.id)
    }

    getRealmByRegion(region) {
        const id = this.regionToGroup.get(region.id)
        return this.realms[id]
    }

    getGroups() {
        return this.realms
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

    isGroupBorder(point) {
        const neighborRegions = this.regionTileMap.getBorderRegions(point)
        if (neighborRegions.length === 0) return false
        const realm = this.getGroup(point)
        for (let region of neighborRegions) {
            const id = this.regionToGroup.get(region.id)
            if (id !== realm.id) return true
        }
        return false
    }

    getAverageRegionArea() {
        const regions = this.regionTileMap.getRegions()
        return Math.round(this.area / regions.length)
    }

    map(callback) {
        return this.realms.map(callback)
    }

    forEach(callback) {
        this.realms.forEach(callback)
    }
}


class Realm {
    constructor(id, origin, area) {
        this.id = id
        this.area = area
        this.origin = origin
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
        return !this.model.regionToGroup.has(region.id)
    }

    setValue(region) {
        this.model.regionToGroup.set(region.id, this.id)
        this.area += region.area
    }

    checkNeighbor(neighborRegion, region) {
        if (this.isEmpty(neighborRegion)) return
        const neighborGroupId = this.model.regionToGroup.get(neighborRegion.id)
        if (neighborGroupId === this.id) return
        this.model.borderRegions.add(region.id)
        this.model.graph.setEdge(this.id, neighborGroupId)
    }

    getNeighbors(region) {
        return this.model.regionTileMap.getNeighborRegions(region)
    }
}
