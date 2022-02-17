import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { RealmTileMap } from '/src/model/tilemap/realm'
import { GeologyTileMapDiagram } from './diagram'
import { ContinentModel } from './continent'


const ID = 'GeologyTileMap3'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x100'}),
    Type.number('scale', 'Scale', {default: 25, step: 1, min: 1, max: 100}),
    Type.number('continentRate', 'Continent rate', {default: .2, step: .05, min: .1, max: .8}),
    Type.text('seed', 'Seed', {default: ''})
)


export class GeologyTileMap3 extends TileMap {
    static id = ID
    static diagram = GeologyTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new GeologyTileMap3(params)
    }

    #realmTileMap
    #continentModel

    constructor(params) {
        super(params)
        this.#realmTileMap = this._buildRealmTileMap(params)
        this.#continentModel = new ContinentModel(params, this.#realmTileMap)
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
        return {
            continent,
            group,
            isOcean: this.continent.isOceanic(continent),
            // area: this.continent.getArea(continent),
        }
    }

    get continent() {
        return this.#continentModel
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
