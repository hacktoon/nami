import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Matrix } from '/src/lib/matrix'

import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'
import { NoiseTileMap } from '/src/model/tilemap/noise'
import { ClimateTileMapDiagram } from './diagram'
import { ClimateModel } from './model'


const ID = 'ClimateTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x100'}),
    Type.text('seed', 'Seed', {default: ''}),
)


export class ClimateTileMap extends TileMap {
    static id = ID
    static diagram = ClimateTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new ClimateTileMap(params)
    }

    #climateMap
    #model

    #buildNoiseTileMap() {
        return NoiseTileMap.fromData({
            rect: this.rect.hash(),
            octaves: 5,
            resolution: .8,
            scale: .01,
            seed: this.seed,
        })
    }

    constructor(params) {
        super(params)
        const noiseTileMap = this.#buildNoiseTileMap()
        this.#model = new ClimateModel()
        this.#climateMap = Matrix.fromRect(this.rect, point => {
            const noise = noiseTileMap.getNoise(point)
            return this.#model.climateByRatio(noise).id
        })
    }

    get(point) {
        const id = this.#climateMap.get(point)
        return this.#model.fromId(id).name
    }

    getColor(point) {
        const id = this.#climateMap.get(point)
        return this.#model.fromId(id).color
    }
}
