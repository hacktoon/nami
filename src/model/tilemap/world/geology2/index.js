import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Point } from '/lib/point'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'

import { RegionTileMap } from '/model/tilemap/region'
import { ContinentModel } from './continent'
import { GeologyTileMapDiagram } from './diagram'


const ID = 'GeologyTileMap2'
const SCHEMA = new Schema(
    ID,
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 25, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 60, step: 1, min: 1, max: 100}),
    Type.number('chance', 'Chance', {default: .1, step: .05, min: 0, max: 1}),
    Type.text('seed', 'Seed', {default: ''})
)


export class GeologyTileMap2 extends TileMap {
    static id = ID
    static diagram = GeologyTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new GeologyTileMap2(params)
    }

    #continentRegionTileMap
    #continentModel

    constructor(params) {
        super(params)
        this.#continentRegionTileMap = this._buildContinentRegionTileMap(params)
        this.#continentModel = new ContinentModel(this.#continentRegionTileMap)
    }

    _buildContinentRegionTileMap(params) {
        return RegionTileMap.fromData({
            width: params.get('width'),
            height: params.get('height'),
            scale: params.get('scale'),
            growth: params.get('growth'),
            chance: params.get('chance'),
            seed: this.seed,
        })
    }

    get(point) {
        const plateId = this.getPlate(point)
        return [
            `point(${Point.hash(point)})`,
            `continent(${plateId})`,
        ].join(', ')
    }

    getPlate(point) {
        return this.#continentRegionTileMap.getRegion(point)
    }

    getPlateDirection(point) {
        const plateId = this.#continentRegionTileMap.getRegion(point)
        return this.#continentModel.getDirection(plateId)
    }

    getPlateOrigin(point) {
        const plateId = this.#continentRegionTileMap.getRegion(point)
        return this.#continentRegionTileMap.getOriginById(plateId)
    }

    isPlateBorder(point) {
        return this.#continentRegionTileMap.isBorder(point)
    }

    isPlateOceanic(plateId) {
        return this.#continentModel.isOceanic(plateId)
    }

    isPlateOrigin(point) {
        const regionOrigin = this.#continentRegionTileMap.getRegionOrigin(point)
        return Point.equals(regionOrigin, point)
    }

    getDescription() {
        return `${this.#continentModel.size} plates`
    }

    map(callback) {
        return this.#continentModel.getPlates().map(callback)
    }
}
