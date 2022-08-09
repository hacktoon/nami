import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { Matrix } from '/src/lib/matrix'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseTileMap } from '/src/model/tilemap/noise'
import { SurfaceTileMapDiagram } from './diagram'
import { HeightMultiFill } from './fill'


const ID = 'SurfaceTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x100'}),
    Type.number('seaLevel', 'Sea Level', {default: .55, step: .01, min: .1, max: 1}),
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

    #landNoiseTileMap
    #heightNoiseTileMap
    #surfaceMap
    #heightMap
    #shorePoints = []

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

    #buildSurfaceMap(params) {
        return Matrix.fromRect(this.rect, point => {
            const seaLevel = params.get('seaLevel')
            let level = this.#landNoiseTileMap.getNoise(point)
            if (level <= seaLevel)
                return 0
            // detect shore points
            for(let sidePoint of Point.adjacents(point)) {
                let level = this.#landNoiseTileMap.getNoise(sidePoint)
                if (level <= seaLevel) {
                    this.#shorePoints.push(point)
                    return 2
                }
            }
            if (this.#heightNoiseTileMap.getNoise(point) > .3 &&
            this.#heightNoiseTileMap.getNoise(point) < .6) {
                return 3
            }
            return 1
        })
    }

    #buildHeightMap() {
        const heightMap = Matrix.fromRect(this.rect)
        const mapFill = new HeightMultiFill(this.#shorePoints, {
            surfaceMap: this.#surfaceMap,
            heightMap: heightMap,
        })
        mapFill.fill()
        return heightMap
    }

    constructor(params) {
        super(params)
        this.#landNoiseTileMap = this.#buildLandNoiseTileMap()
        this.#heightNoiseTileMap = this.#builHeightNoiseTileMap()
        this.#surfaceMap = this.#buildSurfaceMap(params)
        this.#heightMap = this.#buildHeightMap()
    }

    get(point) {
        return {
            surface: this.#surfaceMap.get(point),
            height: this.#heightMap.get(point),
        }
    }

    getSurface(point) {
        return this.#surfaceMap.get(point)
    }

    getHeight(point) {
        return this.#heightNoiseTileMap.get(point)
    }
}
