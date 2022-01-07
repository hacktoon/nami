import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Point } from '/lib/point'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'
import { RegionTileMap } from '/model/tilemap/region'

import { TectonicsNoRealmTileMapDiagram } from './diagram'
import { PlateModel } from './plate'
import { BoundaryModel } from './boundary'


const ID = 'TectonicsNoRealmTileMap'
const SCHEMA = new Schema(
    ID,
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 25, step: 1, min: 1, max: 50}),
    Type.number('growth', 'Growth', {default: 50, step: 1, min: 0, max: 100}),
    Type.number('chance', 'Chance', {default: .1, step: .1, min: 0, max: 1}),
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

    #regionTileMap
    #plateModel
    #boundaryModel

    constructor(params) {
        super(params)
        let t0 = performance.now()
        this.#regionTileMap = this._buildRegioTileMap(params)
        this.#plateModel = new PlateModel(this.#regionTileMap)
        this.#boundaryModel = new BoundaryModel(
            this.#regionTileMap,
            this.#plateModel
        )
        window.boundaryModel = this.#boundaryModel

        console.log(`TectonicsTileMap: ${Math.round(performance.now() - t0)}ms`);
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
        const regionOrigin = this.#regionTileMap.getRegionOrigin(point)

        return [
            `point: ${Point.hash(point)}`,
            `plate ${plateId} at (${Point.hash(regionOrigin)})`
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

    isPlateOrigin(plateId, point) {
        const origin = this.#regionTileMap.getOriginById(plateId)
        return Point.equals(origin, this.#regionTileMap.rect.wrap(point))
    }

    isPlateBorder(point) {
        return this.#regionTileMap.isBorder(point)
    }

    isPlateOceanic(plateId) {
        return this.#plateModel.isOceanic(plateId)
    }

    isRegionOrigin(point) {
        const regionOrigin = this.#regionTileMap.getRegionOrigin(point)
        return Point.equals(regionOrigin, point)
    }

    getDescription() {
        return `${this.#plateModel.size} plates`
    }

    map(callback) {
        const plates = this.#plateModel.getPlates()
        return plates.map(callback)
    }
}
