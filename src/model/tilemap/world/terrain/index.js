import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { Matrix } from '/src/lib/matrix'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseTileMap } from '/src/model/tilemap/noise'
import { TerrainTileMapDiagram } from './diagram'
import { TerrainModel, WATER_OUTLINE, LAND_OUTLINE } from './model'


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

    #outlineNoiseTileMap
    #outlineMap
    #landCount = 0
    #shorePoints = new PointSet()
    #model

    #buildOutlineNoiseTileMap() {
        return NoiseTileMap.fromData({
            rect: this.rect.hash(),
            octaves: 6,
            resolution: .8,
            scale: .02,
            seed: this.seed,
        })
    }

    #buildLandNoiseTileMap() {
        return NoiseTileMap.fromData({
            rect: this.rect.hash(),
            octaves: 5,
            resolution: .8,
            scale: .05,
            seed: this.seed,
        })
    }

    #buildOutlineMap() {
        let points = []
        const outlineMap = Matrix.fromRect(this.rect, point => {
            let noise = this.#outlineNoiseTileMap.getNoise(point)
            if (this.#model.isLand(noise)) {
                this.#landCount += 1
                if (this.#isShorePoint(point)) {
                    this.#shorePoints.add(point)
                    points.push(point)
                }
                return LAND_OUTLINE.id
            }
            return WATER_OUTLINE.id
        })
        return outlineMap
    }

    #isShorePoint(point) {
        for(let sidePoint of Point.adjacents(point)) {
            let sideNoise = this.#outlineNoiseTileMap.getNoise(sidePoint)
            if (! this.#model.isLand(sideNoise)) {
                return true
            }
        }
        return false
    }

    constructor(params) {
        super(params)
        this.#model = new TerrainModel()
        this.#outlineNoiseTileMap = this.#buildOutlineNoiseTileMap()
        this.#outlineMap = this.#buildOutlineMap()
    }

    get(point) {
        const outline = this.getOutline(point).name
        return `outline: ${outline}`
    }

    getLandRatio() {
        const landCount = this.#landCount
        return Math.round((landCount * 100) / this.area)
    }

    getOutline(point) {
        const id = this.#outlineMap.get(point)
        return this.#model.outlineById(id)
    }

    getType(point) {
        const id = this.#outlineMap.get(point)
        return this.#model.fromId(id)
    }

    isShore(point) {
        return this.#shorePoints.has(point)
    }

    getDescription() {
        const landRatio = this.getLandRatio()
        return `${landRatio}% land`
    }
}
