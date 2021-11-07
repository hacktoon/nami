import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Point } from '/lib/point'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'
import { RealmTileMap } from '/model/tilemap/realm'

import { TectonicsTileMapDiagram } from './diagram'
import { PlateModel } from './plate'
import { ProvinceModel } from './province'
import { HotspotModel } from './hotspots'


const ID = 'TectonicsTileMap'
const SCHEMA = new Schema(
    ID,
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 20, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 40, step: 1, min: 1, max: 100}),
    Type.text('seed', 'Seed', {default: ''})
)


export class TectonicsTileMap extends TileMap {
    static id = ID
    static diagram = TectonicsTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new TectonicsTileMap(params)
    }

    constructor(params) {
        super(params)
        let t0 = performance.now()
        this.realmTileMap = this._buildRealmTileMap(params)
        this.plateModel = new PlateModel(this.realmTileMap)
        // TODO: rename to VolcanismModel
        this.hotspotModel = new HotspotModel(this.realmTileMap, this.plateModel)
        this.provinceModel = new ProvinceModel(this.realmTileMap, this.plateModel)
        console.log(`TectonicsTileMap: ${Math.round(performance.now() - t0)}ms`);
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
        const deformation = this.getDeformation(point)
        const provinceName = this.provinceModel.getBoundaryName(regionId)
        const type = this.isPlateOceanic(plateId) ? 'Oceanic' : 'Continental'
        return [
            `point: ${Point.hash(point)}, `,
            `region: ${regionId}(${Point.hash(regionOrigin)}), `,
            `${type} plate: ${plateId}, `,
            `weight: ${this.plateModel.getWeight(plateId)}, `,
            `province: ${provinceName}, `,
            `deformation: ${deformation.name}`
        ].join('')
    }

    getProvince(point) {
        const regionId = this.realmTileMap.getRegion(point)
        return this.provinceModel.getProvinceByRegion(regionId)
    }

    getBoundary(provinceId) {
        return this.provinceModel.getBoundary(provinceId)
    }

    getBoundaryIds() {
        return this.provinceModel.getBoundaryIds()
    }

    getDeformation(point) {
        const regionId = this.realmTileMap.getRegion(point)
        return this.provinceModel.getDeformation(regionId)
    }

    getPlate(point) {
        return this.realmTileMap.getRealm(point)
    }

    getPlateDirection(point) {
        const realmId = this.realmTileMap.getRealm(point)
        return this.plateModel.getDirection(realmId)
    }

    getPlateOrigin(point) {
        const realmId = this.realmTileMap.getRealm(point)
        return this.realmTileMap.getRealmOriginById(realmId)
    }

    isPlateOrigin(plateId, point) {
        const origin = this.realmTileMap.getRealmOriginById(plateId)
        return Point.equals(origin, this.realmTileMap.rect.wrap(point))
    }

    isPlateBorder(point) {
        return this.realmTileMap.isRealmBorder(point)
    }

    isPlateOceanic(plateId) {
        return this.plateModel.isOceanic(plateId)
    }

    isRegionOrigin(point) {
        const regionOrigin = this.realmTileMap.getRegionOrigin(point)
        return Point.equals(regionOrigin, point)
    }

    getDescription() {
        return `${this.plateModel.size} plates`
    }

    map(callback) {
        const plates = this.plateModel.getPlates()
        return plates.map(callback)
    }
}
