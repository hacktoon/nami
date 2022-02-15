import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Point } from '/lib/point'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'

import { RealmTileMap } from '/model/tilemap/realm'
import { GeologyTileMapDiagram } from './diagram'
import { ContinentModel } from './continent'
import { ProvinceModel } from './province'


const ID = 'GeologyTileMap2'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x100'}),
    Type.number('scale', 'Scale', {default: 25, step: 1, min: 1, max: 100}),
    Type.number('continentRate', 'Continent rate', {default: .2, step: .05, min: .1, max: .8}),
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
    #provinceModel

    constructor(params) {
        super(params)
        this.#realmTileMap = this._buildRealmTileMap(params)
        this.#continentModel = new ContinentModel(params, this.#realmTileMap)
        this.#provinceModel = new ProvinceModel(
            this.#realmTileMap,
            this.#continentModel
        )
    }

    _buildRealmTileMap(params) {
        return RealmTileMap.fromData({
            rect: this.rect.hash(),
            scale: params.get('scale'),
            growth: 5,
            chance: .1,
            rgScale: 3,
            rgGrowth: 3,
            rgChance: .1,
            seed: this.seed,
        })
    }

    get(point) {
        const continent = this.continent.get(point)
        const group = this.continent.getGroup(continent)
        const province = this.province.get(point)
        return {
            continent,
            province,
            group,
            // provinceType: this.province.getType(province),
            area: this.continent.getArea(continent),
            isOcean: this.continent.isOceanic(continent),
            point: Point.hash(point),
        }
    }

    get continent() {
        return this.#continentModel
    }

    get province() {
        return this.#provinceModel
    }

    getDescription() {
        return [
            `${this.#realmTileMap.size} continents`,
            `${this.continent.groups.length} groups`,
        ].join(', ')
    }

    map(callback) {
        return this.continent.ids.map(callback)
    }
}
