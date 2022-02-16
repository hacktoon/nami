import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Graph } from '/src/lib/graph'
import { PairMap } from '/src/lib/map'

import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { RegionTileMap } from '/src/model/tilemap/region'

import { RealmSampling } from './sampling'
import { RealmTileMapDiagram } from './diagram'
import { RealmMultiFill } from './fill'


const ID = 'RealmTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x100'}),
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

    #borderSizeMap = new PairMap()
    #borderRegionMap = new Map()
    #cornerRegionSet = new Set()
    #regionToRealm = new Map()
    #areaMap = new Map()
    #graph = new Graph()
    #borderRegions = []
    #regionTileMap
    #realmSamples
    #realms

    constructor(params) {
        super(params)
        let t0 = performance.now()
        const scale = params.get('scale')
        this.#regionTileMap = this._buildRegionTileMap(params)
        this.#realmSamples = new RealmSampling(this.#regionTileMap, scale)
        this.#realms = this.#realmSamples.map((_, id) => {
            this.#areaMap.set(id, 0)
            return id
        })
        new RealmMultiFill(this.#realmSamples.points, {
            borderRegionMap: this.#borderRegionMap,
            borderSizeMap: this.#borderSizeMap,
            regionTileMap: this.#regionTileMap,
            regionToRealm: this.#regionToRealm,
            areaMap: this.#areaMap,
            graph: this.#graph,
            params,
        }).fill()
        this.#borderRegionMap.forEach((neighbors, region) => {
            this.#borderRegions.push(region)
            if (neighbors.size > 1) {
                this.#cornerRegionSet.add(region)
            }
        })
        console.log(`RealmTileMap: ${Math.round(performance.now() - t0)}ms`);
    }

    _buildRegionTileMap(params) {
        const data = {
            rect: this.rect.hash(),
            scale: params.get('rgScale'),
            seed: params.get('seed'),
            chance: params.get('rgChance'),
            growth: params.get('rgGrowth')
        }
        return RegionTileMap.fromData(data)
    }

    get(point) {
        const realm = this.getRealm(point)
        const region = this.getRegion(point)
        return {
            realm,
            region,
            realmArea: this.getArea(realm),
            isCorner: this.isCornerRegion(region),
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

    getRealmByRegion(region) {
        return this.#regionToRealm.get(region)
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

    getBorderSize(realm, sideRealm) {
        return this.#borderSizeMap.get(realm, sideRealm)
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
        return this.#borderRegionMap.has(region)
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
