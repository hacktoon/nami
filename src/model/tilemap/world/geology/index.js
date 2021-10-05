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
        this.realm = this._buildRealmMap(this.seed, params)
        this.tectonicsModel = new TectonicsModel(this.realm)
        this.erosionModel = new ErosionModel(this.realm, this.tectonicsModel)
    }

    _buildRealmMap(seed, params) {
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
        const region = this.realm.getRegion(point)
        const landform = this.getLandform(point)
        const boundary = this.tectonicsModel.getBoundary(region.id)
        const eroded = this.getErodedLandform(point)
        return [
            `point: ${Point.hash(point)}, plate: ${plate.id}`,
            `, region: ${region.id}@${Point.hash(region.origin)}`,
            `, boundary: ${boundary.name}`,
            `, landform: ${eroded.name} (was ${landform.name})`
        ].join('')
    }

    getPlate(point) {
        const realm = this.realm.getRealm(point)
        return this.tectonicsModel.get(realm.id)
    }

    getPlates() {
        return this.tectonicsModel.getPlates()
    }

    isPlateOrigin(plate, point) {
        // TODO: eliminate this dependency
        const matrix = this.realm.regionTileMap.regionMatrix
        return Point.equals(plate.origin, matrix.wrap(point))
    }

    isPlateBorder(point) {
        return this.realm.isRealmBorder(point)
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
