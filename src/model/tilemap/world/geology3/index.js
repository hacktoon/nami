import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { RegionTileMap } from '/src/model/tilemap/region'
import { GeologyTileMapDiagram } from './diagram'
import { ContinentModel } from './continent'
import { SurfaceModel } from './surface'


const ID = 'GeologyTileMap3'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x100'}),
    Type.number('scale', 'Scale', {default: 30, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 50, step: 1, min: 1, max: 100}),
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

    #regionTileMap
    #continentModel
    #surfaceModel

    constructor(params) {
        super(params)
        this.#regionTileMap = this._buildRegionTileMap(params)
        this.#continentModel = new ContinentModel(params, this.#regionTileMap)
        this.#surfaceModel = new SurfaceModel(
            this.#regionTileMap,
            this.#continentModel
        )
    }

    _buildRegionTileMap(params) {
        return RegionTileMap.fromData({
            rect: this.rect.hash(),
            scale: params.get('scale'),
            growth: params.get('growth'),
            seed: this.seed,
            chance: .2,
        })
    }

    get(point) {
        const continent = this.continent.get(point)
        return {
            continent,
            surfaceLevel: this.surface.getLevel(point),
            isOcean: this.continent.isOceanic(continent)
        }
    }

    get continent() {
        return this.#continentModel
    }

    get surface() {
        return this.#surfaceModel
    }

    getDescription() {
        return [
            `${this.#regionTileMap.size} continents`,
        ].join(', ')
    }

    map(callback) {
        return this.continent.ids.map(callback)
    }
}
