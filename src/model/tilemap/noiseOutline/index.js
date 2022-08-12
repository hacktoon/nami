import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseOutlineTileMapDiagram } from './diagram'
import { OutlineModel } from './model'


const ID = 'NoiseOutlineTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x100'}),
    Type.number('ratio', 'Ratio', {default: .55, min: 0.1, step: .01, max: 1}),
    Type.text('seed', 'Seed', {default: ''}),
)


export class NoiseOutlineTileMap extends TileMap {
    static id = ID
    static diagram = NoiseOutlineTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new NoiseOutlineTileMap(params)
    }

    #outlineModel

    constructor(params) {
        super(params)
        const modelParams = {
            octaves: 6,
            resolution: .8,
            scale: .02,
            ratio: params.get('ratio')
        }
        this.#outlineModel = new OutlineModel(this.rect, this.seed, modelParams)
        // this.#reliefMap = this.#buildReliefMap()
    }

    get(point) {
        const outline = this.#outlineModel.get(point)
        const isMargin = this.isMargin(point)
        return `outline: ${outline.name}, isMargin: ${isMargin}`
    }

    getHigherRatio() {
        const higherCount = this.#outlineModel.highCount
        return Math.round((higherCount * 100) / this.area)
    }

    getOutline(point) {
        return this.#outlineModel.get(point)
    }

    isHigherMargin(point) {
        return this.#outlineModel.isHigherMargin(point)
    }

    isLowerMargin(point) {
        return this.#outlineModel.isLowerMargin(point)
    }

    isHigher(point) {
        return this.#outlineModel.isHigher(point)
    }

    isLower(point) {
        return this.#outlineModel.isLower(point)
    }

    isMargin(point) {
        return this.isLowerMargin(point) || this.isHigherMargin(point)
    }

    getDescription() {
        const landRatio = this.getHigherRatio()
        return `${landRatio}% higher`
    }
}
