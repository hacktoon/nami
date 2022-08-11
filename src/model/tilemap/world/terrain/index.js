import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { Matrix } from '/src/lib/matrix'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseTileMap } from '/src/model/tilemap/noise'
import { TerrainTileMapDiagram } from './diagram'
import { HeightMultiFill } from './fill'
import { TerrainModel } from './model'


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
    #reliefNoiseTileMap
    #typeMap
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

    #buildReliefNoiseTileMap() {
        return NoiseTileMap.fromData({
            rect: this.rect.hash(),
            octaves: 5,
            resolution: .8,
            scale: .03,
            seed: this.seed,
        })
    }

    #buildOutlineMap(params) {
        // use flood fill to add or remove land to reach 60% water
        // const mapFill = new HeightMultiFill(this.#shorePoints, {
        //     outlineMap: outlineMap,
        //     typeMap: typeMap,
        // })
        // mapFill.fill()
    }

    #buildTypeMap() {
        const typeMap = Matrix.fromRect(this.rect, point => {
            let noise = this.#outlineNoiseTileMap.getNoise(point)
            const terrain = this.#model.terrainByRatio(noise)
            if (terrain.isLand) {
                // detect shore points
                for(let sidePoint of Point.adjacents(point)) {
                    let noise2 = this.#outlineNoiseTileMap.getNoise(sidePoint)
                    const terrain2 = this.#model.terrainByRatio(noise2)
                    if (! terrain2.isLand) {
                        this.#shorePoints.add(point)
                        break
                    }
                }
                this.#landCount += 1
            }
            return terrain.id
        })
        return typeMap
    }

    constructor(params) {
        super(params)
        this.#model = new TerrainModel()
        this.#outlineNoiseTileMap = this.#buildOutlineNoiseTileMap()
        this.#reliefNoiseTileMap = this.#buildReliefNoiseTileMap()
        this.#typeMap = this.#buildTypeMap()
    }

    get(point) {
        return this.getType(point).name
    }

    isShore(point) {
        return this.#shorePoints.has(point)
    }

    getType(point) {
        const id = this.#typeMap.get(point)
        return this.#model.fromId(id)
    }

    getDescription() {
        const landCount = this.#landCount
        const landRatio = Math.round((landCount * 100) / this.area)
        return `${landRatio}% land`
    }
}
