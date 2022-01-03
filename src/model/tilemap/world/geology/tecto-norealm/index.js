import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Point } from '/lib/point'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'
import { RegionTileMap } from '/model/tilemap/region'

import { TectonicsNoRealmTileMapDiagram } from './diagram'


const ID = 'TectonicsNoRealmTileMap'
const SCHEMA = new Schema(
    ID,
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 20, step: 1, min: 1, max: 50}),
    Type.number('growth', 'Growth', {default: 40, step: 1, min: 0, max: 50}),
    Type.text('seed', 'Seed', {default: ''})
)


export class TectonicsNoRealmTileMap extends TileMap {
    static id = ID
    static diagram = TectonicsNoRealmTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new TectonicsNoRealmTileMap(params)
    }

    constructor(params) {
        super(params)
        let t0 = performance.now()
        this.regionTileMap = this._buildRegioTileMap(params)
        this.plateModel = new PlateModel(this.regionTileMap)

        console.log(`TectonicsNoRealmTileMap: ${Math.round(performance.now() - t0)}ms`);
    }

    _buildRegioTileMap(params) {
        return RegionTileMap.fromData({
            seed: this.seed,
            width: params.get('width'),
            height: params.get('height'),
            scale: params.get('scale'),
            growth: params.get('growth'),
            chance: .1,
        })
    }

    get(point) {
        const plateId = this.getPlate(point)
        const regionId = this.regionTileMap.getRegion(point)
        const regionOrigin = this.regionTileMap.getRegionOrigin(point)
        const deformation = this.getDeformation(point)
        const provinceName = this.provinceModel.getBoundaryName(regionId)
        const type = this.isPlateOceanic(plateId) ? 'Oceanic' : 'Continental'
        const stress = this.getStress(point)
        return [
            `point: ${Point.hash(point)}, `,
            `region: ${regionId}(${Point.hash(regionOrigin)}), `,
            `${type} plate: ${plateId}, `,
            `weight: ${this.plateModel.getWeight(plateId)}, `,
            `province: ${provinceName}, `,
            `stress: ${stress}, `,
            `deformation: ${deformation.name}`
        ].join('')
    }

    getProvince(point) {
        const regionId = this.regionTileMap.getRegion(point)
        return this.provinceModel.getProvinceByRegion(regionId)
    }

    getBoundary(provinceId) {
        return this.provinceModel.getBoundary(provinceId)
    }

    getBoundaryIds() {
        return this.provinceModel.getBoundaryIds()
    }

    getDeformation(point) {
        const regionId = this.regionTileMap.getRegion(point)
        return this.provinceModel.getDeformation(regionId)
    }

    getStress(point) {
        const regionId = this.regionTileMap.getRegion(point)
        return this.provinceModel.getStress(regionId)
    }

    getPlate(point) {
        return this.regionTileMap.getRealm(point)
    }

    getPlateDirection(point) {
        const realmId = this.regionTileMap.getRealm(point)
        return this.plateModel.getDirection(realmId)
    }

    getPlateOrigin(point) {
        const realmId = this.regionTileMap.getRealm(point)
        return this.regionTileMap.getRealmOriginById(realmId)
    }

    isPlateOrigin(plateId, point) {
        const origin = this.regionTileMap.getRealmOriginById(plateId)
        return Point.equals(origin, this.regionTileMap.rect.wrap(point))
    }

    isPlateBorder(point) {
        return this.regionTileMap.isRealmBorder(point)
    }

    isPlateOceanic(plateId) {
        return this.plateModel.isOceanic(plateId)
    }

    isRegionOrigin(point) {
        const regionOrigin = this.regionTileMap.getRegionOrigin(point)
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
