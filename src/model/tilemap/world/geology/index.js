import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Point } from '/lib/point'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'
import { RealmTileMap } from '/model/tilemap/realm'

import { GeologyTileMapDiagram } from './diagram'
import { PlateModel } from './plate'
import { TectonicsModel } from './tectonics'
import { HotspotModel } from './hotspots'
import { ErosionModel } from './erosion'


const ID = 'GeologyTileMap'
const SCHEMA = new Schema(
    ID,
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 20, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 40, step: 1, min: 1, max: 100}),
    Type.text('seed', 'Seed', {default: ''})
)


export class GeologyTileMap extends TileMap {
    static id = ID
    static diagram = GeologyTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new GeologyTileMap(params)
    }

    constructor(params) {
        super(params)
        let t0 = performance.now()
        this.realmTileMap = this._buildRealmTileMap(params)
        this.plateModel = new PlateModel(this.realmTileMap)
        this.tectonicsModel = new TectonicsModel(this.realmTileMap, this.plateModel)
        this.hotspotModel = new HotspotModel(
            this.realmTileMap,
            this.plateModel,
            this.tectonicsModel)
        this.erosionModel = new ErosionModel(this)
        console.log(`Geology Model: ${Math.round(performance.now() - t0)}ms`);
    }

    _buildRealmTileMap(params) {
        return RealmTileMap.fromData({
            seed: this.seed,
            width: params.get('width'),
            height: params.get('height'),
            scale: params.get('scale'),
            growth: params.get('growth'),
            chance: .1,
            rgChance: .1,
            rgGrowth: 0,
            rgScale: 1,
        })
    }

    get(point) {
        const plateId = this.getPlate(point)
        const regionId = this.realmTileMap.getRegion(point)
        const regionOrigin = this.realmTileMap.getRegionOrigin(point)
        const landform = this.getLandform(point)
        const boundary = this.tectonicsModel.getBoundary(regionId)
        const eroded = this.getErodedLandform(point)
        return [
            `point: ${Point.hash(point)}, plate: ${plateId}`,
            `, type: ${this.isOceanic(plateId)?'Oceanic':'Continental'}`,
            `, weight: ${this.getWeight(plateId)}`,
            `, region: ${regionId}@${Point.hash(regionOrigin)}`,
            `, boundary: ${boundary.name}`,
            `, landform: ${eroded.name} (was ${landform.name})`
        ].join('')
    }

    getPlate(point) {
        return this.realmTileMap.getRealm(point)
    }

    getBoundary(point) {
        const regionId = this.realmTileMap.getRegion(point)
        return this.tectonicsModel.getBoundary(regionId)
    }

    getPlateDirection(point) {
        const realmId = this.realmTileMap.getRealm(point)
        return this.tectonicsModel.getPlateDirection(realmId)
    }

    getPlateOrigin(point) {
        const realmId = this.realmTileMap.getRealm(point)
        return this.realmTileMap.getRealmOriginById(realmId)
    }

    isPlateOrigin(plateId, point) {
        const origin = this.realmTileMap.getRealmOriginById(plateId)
        return Point.equals(origin, this.realmTileMap.rect.wrap(point))
    }

    isRegionOrigin(point) {
        const regionOrigin = this.realmTileMap.getRegionOrigin(point)
        return Point.equals(regionOrigin, point)
    }

    isPlateBorder(point) {
        return this.realmTileMap.isRealmBorder(point)
    }

    getWeight(realmId) {
        return this.tectonicsModel.getWeight(realmId)
    }

    isOceanic(plateId) {
        return this.tectonicsModel.isOceanic(plateId)
    }

    getLandform(point) {
        return this.erosionModel.get(point)
    }

    getErodedLandform(point) {
        return this.erosionModel.getErodedLandform(point)
    }

    getDescription() {
        return `${this.tectonicsModel.size} plates`
    }

    map(callback) {
        const plates = this.tectonicsModel.getPlates()
        return plates.map(callback)
    }
}
