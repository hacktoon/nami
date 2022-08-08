import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { Matrix } from '/src/lib/matrix'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseTileMap } from '/src/model/tilemap/noise'
import { SurfaceTileMapDiagram } from './diagram'


const ID = 'SurfaceTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x100'}),
    Type.number('seaLevel', 'Sea Level', {default: .65, step: .01, min: .1, max: 1}),
    Type.text('seed', 'Seed', {default: ''}),
)


export class SurfaceTileMap extends TileMap {
    static id = ID
    static diagram = SurfaceTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new SurfaceTileMap(params)
    }

    #noiseTileMap
    #surfaceMap
    #shorePoints

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
            octaves: 6,
            resolution: .8,
            scale: .02,
            seed: this.seed,
        })
    }

    constructor(params) {
        super(params)
        this.#noiseTileMap = this.#buildLandNoiseTileMap()
        this.#shorePoints = []
        this.#surfaceMap = Matrix.fromRect(this.rect, point => {
            const seaLevel = params.get('seaLevel')
            let level = this.#noiseTileMap.getNoise(point)
            if (level <= seaLevel)
                return 0
            // detect shore points
            for(let sidePoint of Point.adjacents(point)) {
                let level = this.#noiseTileMap.getNoise(sidePoint)
                if (level <= seaLevel) {
                    this.#shorePoints.push(point)
                    return 2
                }
            }
            return 1
        })
    }

    get(point) {
        return this.#surfaceMap.get(point)
    }
}
