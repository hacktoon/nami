import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { TerrainTileMapDiagram } from './diagram'
import { OutlineModel } from './model/outline'


const ID = 'TerrainTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x100'}),
    Type.text('seed', 'Seed', {default: ''}),
)


export class TerrainTileMap extends TileMap {
    static id = ID
    static diagram = TerrainTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new TerrainTileMap(params)
    }

    #outlineModel

    constructor(params) {
        super(params)
        this.#outlineModel = new OutlineModel(this.rect, this.seed)
        // this.#reliefMap = this.#buildReliefMap()
    }

    get(point) {
        const outline = this.#outlineModel.get(point)
        return `outline: ${outline.name}`
    }

    getLandRatio() {
        const landCount = this.#outlineModel.landCount
        return Math.round((landCount * 100) / this.area)
    }

    getOutline(point) {
        return this.#outlineModel.get(point)
    }

    isLandMargin(point) {
        return this.#outlineModel.isLandMargin(point)
    }

    isWaterMargin(point) {
        return this.#outlineModel.isWaterMargin(point)
    }

    getDescription() {
        const landRatio = this.getLandRatio()
        return `${landRatio}% land`
    }
}
