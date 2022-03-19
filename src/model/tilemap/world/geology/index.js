import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseTileMap } from '/src/model/tilemap/noise'
import { RegionTileMap } from '/src/model/tilemap/region'
import { GeologyTileMapDiagram } from './diagram'
import { ContinentModel } from './continent'
import { ReliefModel } from './relief'


const ID = 'GeologyTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x100'}),
    Type.number('scale', 'Scale', {default: 20, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 90, step: 1, min: 1, max: 100}),
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
    #reliefModel

    #buildRegionTileMap(params) {
        return RegionTileMap.fromData({
            rect: this.rect.hash(),
            scale: params.get('scale'),
            growth: params.get('growth'),
            chance: .1,
            seed: this.seed,
        })
    }

    #buildNoiseTileMap(rect) {
        return NoiseTileMap.fromData({
            rect: rect.hash(),
            octaves:     5,
            resolution: .8,
            scale:      .1,
            seed: this.seed,
        })
    }

    constructor(params) {
        super(params)
        const noiseTileMap = this.#buildNoiseTileMap(this.rect)
        this.#regionTileMap = this.#buildRegionTileMap(params)
        this.#continentModel = new ContinentModel(this.#regionTileMap)
        this.#reliefModel = new ReliefModel(
            noiseTileMap,
            this.#regionTileMap,
            this.#continentModel,
        )
    }


    get(point) {
        const plate = this.continent.getPlate(point)
        return {
            plate,
            continent: this.continent.get(plate),
            level: this.relief.getLevel(point),
            type: this.relief.isWater(point) ? 'water' : 'land',
            plateType: this.continent.isOceanic(plate) ? 'water' : 'land',
        }
    }

    get continent() {
        return this.#continentModel
    }

    get relief() {
        return this.#reliefModel
    }

    getDescription() {
        const landArea = (100 * this.relief.landArea()) / this.area
        return [
            `${this.#regionTileMap.size} plates`,
            `${this.continent.landContinents.length} continents`,
            `${this.continent.oceanContinents.length} oceans`,
            `${Math.round(landArea)}% land`,
        ].join(', ')
    }

    map(callback) {
        return this.continent.ids.map(callback)
    }
}
