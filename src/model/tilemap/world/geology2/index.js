import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Point } from '/lib/point'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'

import { RealmTileMap } from '/model/tilemap/realm'
import { ContinentModel } from './continent'
import { GeologyTileMapDiagram } from './diagram'


const ID = 'GeologyTileMap2'
const SCHEMA = new Schema(
    ID,
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('continentScale', 'Continent scale', {
        default: 33, step: 1, min: 1, max: 100
    }),
    Type.number('provinceScale', 'Province scale', {
        default: 5, step: 1, min: 1, max: 40
    }),
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

    #realmTileMap
    #continentModel

    constructor(params) {
        super(params)
        this.#realmTileMap = this._buildRealmTileMap(params)
        // this.#continentModel = new ContinentModel(this.#realmTileMap)
    }

    _buildRealmTileMap(params) {
        return RealmTileMap.fromData({
            width: params.get('width'),
            height: params.get('height'),
            scale: params.get('continentScale'),
            growth: 1,
            chance: .1,
            rgScale: params.get('provinceScale'),
            rgGrowth: 10,
            rgChance: .1,
            seed: this.seed,
        })
    }

    get(point) {
        const plateId = this.getContinent(point)
        return {
            point: Point.hash(point),
            continent: plateId,
        }
    }

    getContinent(point) {
        return this.#realmTileMap.getRealm(point)
    }

    getContinents() {
        return this.#realmTileMap.getRealms()
    }

    getContinentOrigin(point) {
        return this.#realmTileMap.getRealmOrigin(point)
    }

    isContinentBorder(point) {
        return this.#realmTileMap.isRealmBorder(point)
    }

    isContinentOrigin(point) {
        const origin = this.getContinentOrigin(point)
        return Point.equals(origin, point)
    }

    getDescription() {
        return `${this.#realmTileMap.size} continents`
    }

    map(callback) {
        return this.getContinents().map(callback)
    }
}
