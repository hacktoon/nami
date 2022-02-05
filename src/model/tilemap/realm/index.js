import { Graph } from '/lib/graph'

import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'

import { RegionTileMap } from '/model/tilemap/region'

import { RealmSampling } from './sampling'
import { RealmTileMapDiagram } from './diagram'
import { RealmMultiFill } from './fill'


const ID = 'RealmTileMap'
const SCHEMA = new Schema(
    ID,
    Type.number('width', 'W', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'H', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 33, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 1, step: 1, min: 0, max: 100}),
    Type.number('chance', 'Chance', {default: .1, step: .1, min: .1, max: 1}),
    Type.number('rgScale', 'RgScale', {default: 5, step: 1, min: 1, max: 100}),
    Type.number('rgGrowth', 'RgGrowth', {default: 10, step: 1, min: 0, max: 100}),
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

    #realms
    #regionTileMap
    #realmSamples
    #borderRegions = []
    #borderRegionSet = new Set()
    #cornerRegionSet = new Set()
    #regionToRealm = new Map()
    #areaMap = new Map()
    #graph = new Graph()

    constructor(params) {
        super(params)
        let t0 = performance.now()
        const scale = params.get('scale')
        const cornerCount = new Map()
        this.#regionTileMap = this._buildRegionTileMap(params)
        this.#realmSamples = new RealmSampling(this.#regionTileMap, scale)
        this.#realms = this.#realmSamples.map((_, id) => {
            this.#areaMap.set(id, 0)
            return id
        })
        new RealmMultiFill(this.#realmSamples.points, {
            regionTileMap: this.#regionTileMap,
            regionToRealm: this.#regionToRealm,
            borderRegionSet: this.#borderRegionSet,
            areaMap: this.#areaMap,
            graph: this.#graph,
            params,
        }).fill()
        this.#borderRegions = Array.from(this.#borderRegionSet)
        console.log(`RealmTileMap: ${Math.round(performance.now() - t0)}ms`);
    }

    _buildRegionTileMap(params) {
        const [width, height, seed] = params.get('width', 'height', 'seed')
        const [scale, chance, growth] = params.get(
            'rgScale', 'rgChance', 'rgGrowth')
        const data = {width, height, scale, seed, chance, growth}
        return RegionTileMap.fromData(data)
    }

    get(point) {
        const realm = this.getRealm(point)
        return {
            realm,
            region: this.getRegion(point),
            realmArea: this.getArea(realm),
        }
    }

    get size() {
        return this.#realms.length
    }

    get graph() {
        return this.#graph
    }

    getRealm(point) {
        const regionId = this.getRegion(point)
        return this.#regionToRealm.get(regionId)
    }

    getRealms() {
        return this.#realms
    }

    getRealmOrigin(point) {
        const id = this.getRealm(point)
        return this.#realmSamples.points[id]
    }

    getSideRealms(id) {
        return this.#graph.getEdges(id)
    }

    getArea(id) {
        return this.#areaMap.get(id)
    }

    isRealmBorder(point) {
        const sideRegions = this.#regionTileMap.getBorderRegions(point)
        if (sideRegions.length === 0) {
            return false
        }
        const realmId = this.getRealm(point)
        for (let regionId of sideRegions) {
            const id = this.#regionToRealm.get(regionId)
            if (id !== realmId) {
                return true
            }
        }
        return false
    }

    getRegion(point) {
        return this.#regionTileMap.getRegion(point)
    }

    getRegions() {
        return this.#regionTileMap.getRegions()
    }

    getRegionOrigin(point) {
        return this.#regionTileMap.getRegionOrigin(point)
    }

    getBorderRegions() {
        return this.#borderRegions
    }

    getSideRegions(region) {
        return this.#regionTileMap.getSideRegions(region)
    }

    isBorderRegion(region) {
        return this.#borderRegionSet.has(region)
    }

    isCornerRegion(region) {
        return this.#cornerRegionSet.has(region)
    }

    isRegionBorder(point) {
        return this.#regionTileMap.isBorder(point)
    }

    wrap(point) {
        return this.#regionTileMap.regionMatrix.wrap(point)
    }

    map(callback) {
        return this.#realms.map(callback)
    }

    mapRegions(callback) {
        return this.#regionTileMap.map(callback)
    }

    forEach(callback) {
        this.#realms.forEach(callback)
    }

    getDescription() {
        return `Realms: ${this.#realms.length}, Area: ${this.area}`
    }
}
