import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Point } from '/lib/point'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'

import { RegionTileMap } from '/model/tilemap/region'
import { PlateModel } from './plate'
import { SurfaceModel } from './surface'
import { TectonicsTable } from './table'
import { BoundaryModel } from './boundary'
import { ProvinceModel } from './province'
import { FeatureModel } from './feature'
import { GeologyTileMapDiagram } from './diagram'


const ID = 'GeologyTileMap'
const SCHEMA = new Schema(
    ID,
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 25, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 60, step: 1, min: 1, max: 100}),
    Type.number('chance', 'Chance', {default: .1, step: .05, min: 0, max: 1}),
    Type.number('surfaceSize', 'Surface size', {default: .2, step: .05, min: .1, max: .8}),
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

    #regionTileMap
    #tectonicsTable
    #plateModel
    #surfaceModel
    #boundaryModel
    #provinceModel
    #featureModel

    constructor(params) {
        super(params)
        let t0 = performance.now()
        const surfaceSize = params.get('surfaceSize')
        this.#regionTileMap = this._buildRegioTileMap(params)
        this.#tectonicsTable = new TectonicsTable()
        this.#plateModel = new PlateModel(this.#regionTileMap)
        this.#surfaceModel = new SurfaceModel(
            surfaceSize,
            this.#plateModel
        )
        this.#boundaryModel = new BoundaryModel(
            this.#regionTileMap,
            this.#tectonicsTable,
            this.#plateModel,
            this.#surfaceModel
        )
        this.#provinceModel = new ProvinceModel(
            this.#regionTileMap,
            this.#boundaryModel,
            this.#surfaceModel
        )
        this.#featureModel = new FeatureModel(
            this.#regionTileMap,
            this.#tectonicsTable,
            this.#plateModel,
            this.#provinceModel
        )
        console.log(`GeologyTileMap: ${Math.round(performance.now() - t0)}ms`);
    }

    _buildRegioTileMap(params) {
        return RegionTileMap.fromData({
            seed: this.seed,
            width: params.get('width'),
            height: params.get('height'),
            scale: params.get('scale'),
            growth: params.get('growth'),
            chance: params.get('chance'),
        })
    }

    get(point) {
        const plateId = this.getPlate(point)
        const surface = this.getSurface(point)
        const isContinent = this.#surfaceModel.isContinent(surface)
        const surfaceType = isContinent ? 'continent' : 'ocean'
        const province = this.getProvince(point)
        const maxLevel = this.#provinceModel.getMaxLevel(province.id)
        const provinceLevel = this.getProvinceLevel(point)
        const feature = this.getFeature(point)

        return [
            `point(${Point.hash(point)})`,
            `surface(${surface}, ${surfaceType})`,
            `plate(${plateId})`,
            `province(${province.id})`,
            `level(${provinceLevel}/${maxLevel})`,
            `feature(${feature.name})`,
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

    getSurface(point) {
        const plateId = this.getPlate(point)
        return this.#surfaceModel.get(plateId)
    }

    isContinent(surfaceId) {
        return this.#surfaceModel.isContinent(surfaceId)
    }

    getSurfaces() {
        return this.#surfaceModel.getSurfaces()
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
        const continentCount = this.#surfaceModel.getContinents().length
        const oceanCount = this.#surfaceModel.getOceans().length
        return `${this.#plateModel.size} plates, ${continentCount} continents, ${oceanCount} oceans`
    }

    map(callback) {
        const plates = this.#plateModel.getPlates()
        return plates.map(callback)
    }
}
