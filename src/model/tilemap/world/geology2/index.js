import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Point } from '/lib/point'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'

import { RegionTileMap } from '/model/tilemap/region'
import { PlateModel } from './plate'
import { GeologyTileMapDiagram } from './diagram'


const ID = 'GeologyTileMap2'
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


export class GeologyTileMap2 extends TileMap {
    static id = ID
    static diagram = GeologyTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new GeologyTileMap2(params)
    }

    #plateRegionTileMap
    #plateModel

    constructor(params) {
        super(params)
        this.#plateRegionTileMap = this._buildPlateRegionTileMap(params)
        this.#plateModel = new PlateModel(this.#plateRegionTileMap)
    }

    _buildPlateRegionTileMap(params) {
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
            `plate(${plateId})`,
        ].join(', ')
    }

    getPlate(point) {
        return this.#plateRegionTileMap.getRegion(point)
    }

    getPlateDirection(point) {
        const plateId = this.#plateRegionTileMap.getRegion(point)
        return this.#plateModel.getDirection(plateId)
    }

    getPlateOrigin(point) {
        const plateId = this.#plateRegionTileMap.getRegion(point)
        return this.#plateRegionTileMap.getOriginById(plateId)
    }

    isPlateBorder(point) {
        return this.#plateRegionTileMap.isBorder(point)
    }

    isPlateOceanic(plateId) {
        return this.#plateModel.isOceanic(plateId)
    }

    isPlateOrigin(point) {
        const regionOrigin = this.#plateRegionTileMap.getRegionOrigin(point)
        return Point.equals(regionOrigin, point)
    }

    getDescription() {
        return `${this.#plateModel.size} plates`
    }

    map(callback) {
        return this.#plateModel.getPlates().map(callback)
    }
}
