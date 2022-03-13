import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { RegionTileMap } from '/src/model/tilemap/region'
import { GeologyTileMapDiagram } from './diagram'
import { ContinentModel } from './continent'
import { OutlineModel } from './outline'


const ID = 'GeologyTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x100'}),
    Type.number('scale', 'Scale', {default: 25, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 90, step: 1, min: 1, max: 100}),
    Type.number('continentScale', 'Continent scale', {default: .1, step: .05, min: .1, max: .5}),
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
    #continentModel
    #outlineModel

    constructor(params) {
        super(params)
        this.#regionTileMap = this._buildRegionTileMap(params)
        this.#continentModel = new ContinentModel(params, this.#regionTileMap)
        this.#outlineModel = new OutlineModel(
            this.seed,
            this.#regionTileMap,
            this.#continentModel,
        )
    }

    _buildRegionTileMap(params) {
        return RegionTileMap.fromData({
            rect: this.rect.hash(),
            scale: params.get('scale'),
            growth: params.get('growth'),
            chance: .1,
            seed: this.seed,
        })
    }

    get(point) {
        const plate = this.continent.getPlate(point)
        return {
            plate,
            continent: this.continent.get(plate),
            surfaceLevel: this.surface.getLevel(point),
            type: this.surface.isWater(point) ? 'water' : 'land',
            plateType: this.continent.isOceanic(plate) ? 'water' : 'land',
        }
    }

    get continent() {
        return this.#continentModel
    }

    get surface() {
        return this.#outlineModel
    }

    getDescription() {
        const landArea = (100 * this.surface.landArea()) / this.area
        return [
            `${this.#regionTileMap.size} plates`,
            `${this.continent.ids.length} continents`,
            `${Math.round(landArea)}% land`,
        ].join(', ')
    }

    map(callback) {
        return this.continent.ids.map(callback)
    }
}
