import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Point } from '/lib/point'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'
import { RegionTileMap } from '/model/tilemap/region'

import { TectonicsTileMapDiagram } from './diagram'
import { PlateModel } from './plate'
import { TectonicsTable } from './table'
import { BoundaryModel } from './boundary'
import { ProvinceModel } from './province'
import { FeatureModel } from './feature'


const ID = 'TectonicsTileMap'
const SCHEMA = new Schema(
    ID,
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('continentArea', 'Continent area', {default: .25, step: .1, min: .1, max: .9}),
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

    #regionTileMap
    #tectonicsTable
    #plateModel
    #boundaryModel
    #provinceModel
    #featureModel

    constructor(params) {
        super(params)
        let t0 = performance.now()
        const continentArea = params.get('continentArea')
        this.#regionTileMap = this._buildRegioTileMap(params)
        this.#tectonicsTable = new TectonicsTable()
        this.#plateModel = new PlateModel(this.#regionTileMap)
        this.#boundaryModel = new BoundaryModel(
            this.#regionTileMap,
            this.#tectonicsTable,
            this.#plateModel
        )
        this.#provinceModel = new ProvinceModel(
            this.#regionTileMap,
            this.#boundaryModel
        )
        this.#featureModel = new FeatureModel(
            this.#regionTileMap,
            this.#tectonicsTable,
            this.#plateModel,
            this.#provinceModel
        )
        console.log(`TectonicsTileMap: ${Math.round(performance.now() - t0)}ms`);
    }

    _buildRegioTileMap(params) {
        return RegionTileMap.fromData({
            seed: this.seed,
            width: params.get('width'),
            height: params.get('height'),
            scale: 25,
            growth: 60,
            chance: .1,
        })
    }

    get(point) {
        const plateId = this.getPlate(point)
        const regionOrigin = this.#regionTileMap.getRegionOrigin(point)
        const province = this.#provinceModel.getProvince(point)
        const maxLevel = this.#provinceModel.getMaxLevel(province.id)
        const provinceLevel = this.getProvinceLevel(point)
        const feature = this.getFeature(point)

        return [
            `point: ${Point.hash(point)}`,
            `plate ${plateId} at (${Point.hash(regionOrigin)})`,
            `province: ${province.id}, level ${provinceLevel}`,
            `max: ${maxLevel}`,
            `feature: ${feature.name}`,
        ].join(', ')
    }

    getPlate(point) {
        return this.#regionTileMap.getRegion(point)
    }

    getPlateDirection(point) {
        const plateId = this.#regionTileMap.getRegion(point)
        return this.#plateModel.getDirection(plateId)
    }

    getPlateOrigin(point) {
        const plateId = this.#regionTileMap.getRegion(point)
        return this.#regionTileMap.getOriginById(plateId)
    }

    isPlateBorder(point) {
        return this.#regionTileMap.isBorder(point)
    }

    isPlateOceanic(plateId) {
        return this.#plateModel.isOceanic(plateId)
    }

    getProvince(point) {
        return this.#provinceModel.getProvince(point)
    }

    getProvinceLevel(point) {
        return this.#provinceModel.getProvinceLevel(point)
    }

    getProvinces() {
        return this.#provinceModel.getProvinces()
    }

    isProvinceBorder(point) {
        return this.#provinceModel.isProvinceBorder(point)
    }

    isPlateOrigin(point) {
        const regionOrigin = this.#regionTileMap.getRegionOrigin(point)
        return Point.equals(regionOrigin, point)
    }

    getFeature(point) {
        return this.#featureModel.get(point)
    }

    getDescription() {
        return `${this.#plateModel.size} plates`
    }

    map(callback) {
        const plates = this.#plateModel.getPlates()
        return plates.map(callback)
    }
}
