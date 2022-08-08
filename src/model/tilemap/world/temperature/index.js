import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { Matrix } from '/src/lib/matrix'
import { clamp } from '/src/lib/number'

import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'
import { NoiseTileMap } from '/src/model/tilemap/noise'
import { TemperatureTileMapDiagram } from './diagram'


const ID = 'TemperatureTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x100'}),
    Type.number('level', 'Level', {default: .4, step: .01, min: .1, max: 1}),
    Type.text('seed', 'Seed', {default: ''}),
)


export class TemperatureTileMap extends TileMap {
    static id = ID
    static diagram = TemperatureTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new TemperatureTileMap(params)
    }

    #noiseTileMap
    #temperatureMap

    #buildNoiseTileMap() {
        return NoiseTileMap.fromData({
            rect: this.rect.hash(),
            octaves: 4,
            resolution: .6,
            scale: .015,
            seed: this.seed,
        })
    }

    constructor(params) {
        super(params)
        this.#noiseTileMap = this.#buildNoiseTileMap()
        this.#temperatureMap = Matrix.fromRect(this.rect, point => {
            const level = params.get('level')
            const noise = parseInt(this.#noiseTileMap.getNoise(point) * 100, 10)
            const base = Math.ceil(100 / 4)
            return clamp(Math.floor(noise / base), 0, 4 - 1)
        })
    }

    get(point) {
        return this.#temperatureMap.get(point)
    }

    getDescription() {
        return [`Area: ${this.#noiseTileMap.area}`].join(', ')
    }
}
