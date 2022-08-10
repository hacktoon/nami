import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { Matrix } from '/src/lib/matrix'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseTileMap } from '/src/model/tilemap/noise'
import { TerrainTileMapDiagram } from './diagram'
import { HeightMultiFill } from './fill'
import { LAND_OUTLINE, TerrainModel, WATER_OUTLINE } from './model'


const ID = 'TerrainTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x100'}),
    Type.number('seaLevel', 'Sea Level', {default: .55, step: .01, min: .1, max: 1}),
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

    #landNoiseTileMap
    #heightNoiseTileMap
    #outlineMap
    #typeMap
    #outlineLandCount = 0
    #model

    #buildLandNoiseTileMap() {
        return NoiseTileMap.fromData({
            rect: this.rect.hash(),
            octaves: 6,
            resolution: .8,
            scale: .02,
            seed: this.seed,
        })
    }

    #builHeightNoiseTileMap() {
        return NoiseTileMap.fromData({
            rect: this.rect.hash(),
            octaves: 5,
            resolution: .8,
            scale: .03,
            seed: this.seed,
        })
    }

    #buildOutlineMap(params) {
        const shorePoints = []
        return Matrix.fromRect(this.rect, point => {
            const seaLevel = params.get('seaLevel')
            let level = this.#landNoiseTileMap.getNoise(point)
            if (level <= seaLevel)
                return WATER_OUTLINE.id
            // detect shore points
            this.#outlineLandCount += 1
            for(let sidePoint of Point.adjacents(point)) {
                let level = this.#landNoiseTileMap.getNoise(sidePoint)
                if (level <= seaLevel) {
                    shorePoints.push(point)
                    break
                }
            }
            return LAND_OUTLINE.id
        })
        // use flood fill to add or remove land to reach 60% water
        // const mapFill = new HeightMultiFill(this.#shorePoints, {
        //     outlineMap: outlineMap,
        //     typeMap: typeMap,
        // })
        // mapFill.fill()
    }

    #buildTypeMap(outlineMap) {
        const typeMap = Matrix.fromRect(this.rect, point => {
            let height = this.#landNoiseTileMap.getNoise(point)
            return this.#model.terrainIdByRatio(height)
        })
        console.log(typeMap);
        return typeMap
    }

    constructor(params) {
        super(params)
        this.#model = new TerrainModel()
        this.#landNoiseTileMap = this.#buildLandNoiseTileMap()
        this.#outlineMap = this.#buildOutlineMap(params)
        this.#typeMap = this.#buildTypeMap(this.#outlineMap)
    }

    get(point) {
        return {
            outline: this.getOutline(point).name,
            type: this.getType(point).name,
        }
    }

    getOutline(point) {
        const id = this.#outlineMap.get(point)
        return LAND_OUTLINE.id === id ? LAND_OUTLINE : WATER_OUTLINE
    }

    getType(point) {
        const id = this.#typeMap.get(point)
        return this.#model.fromId(id)
    }
}
