import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Point } from '/lib/point'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'
import { RealmTileMap } from '/model/tilemap/realm'

import { GeologyTileMapDiagram } from './diagram'
import { TectonicsModel } from './tectonics'
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
        this.realmTileMap = this._buildRealmTileMap(this.seed, params)
        console.log(performance.now() - t0);
        this.tectonicsModel = new TectonicsModel(this.realmTileMap)
        this.erosionModel = new ErosionModel(this.realmTileMap, this.tectonicsModel)
    }

    _buildRealmTileMap(seed, params) {
        return RealmTileMap.fromData({
            width: params.get('width'),
            height: params.get('height'),
            realmScale: params.get('scale'),
            realmGrowth: params.get('growth'),
            realmChance: .1,
            seed: seed,
            chance: .1,
            growth: 0,
            scale: 1,
        })
    }

    get(point) {
        const plate = this.getPlate(point)
        const regionId = this.realmTileMap.getRegion(point)
        const regionOrigin = this.realmTileMap.getRegionOrigin(point)
        const landform = this.getLandform(point)
        const boundary = this.tectonicsModel.getBoundary(regionId)
        const eroded = this.getErodedLandform(point)
        return [
            `point: ${Point.hash(point)}, plate: ${plate.id}`,
            `, region: ${regionId}@${Point.hash(regionOrigin)}`,
            `, boundary: ${boundary.name}`,
            `, landform: ${eroded.name} (was ${landform.name})`
        ].join('')
    }

    getPlate(point) {
        const realmId = this.realmTileMap.getRealm(point)
        return this.tectonicsModel.get(realmId)
    }

    getPlates() {
        return this.tectonicsModel.getPlates()
    }

    isPlateOrigin(plate, point) {
        // TODO: eliminate this dependency
        const matrix = this.realmTileMap.regionTileMap.regionMatrix
        return Point.equals(plate.origin, matrix.wrap(point))
    }

    isPlateBorder(point) {
        return this.realmTileMap.isRealmBorder(point)
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
}
