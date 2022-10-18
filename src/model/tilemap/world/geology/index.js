import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { TileMap } from '/src/model/lib/tilemap'
import { UITileMap } from '/src/ui/tilemap'
import { PointSet } from '/src/lib/point/set'

import { NoiseMapSet } from './noise'

import { Terrain } from './data'
import { ErosionLayer } from './erosion'
import { TerrainLayer } from './terrain'

import { GeologyTileMapDiagram } from './diagram'



const ID = 'GeologyTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '100x100'}),
    Type.text('seed', 'Seed', {default: ''}),
)


export class GeologyTileMap extends TileMap {
    static id = ID
    static diagram = GeologyTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new GeologyTileMap(params)
    }

    #shorePoints
    #terrainLayer

    constructor(params) {
        super(params)
        const props = {
            noiseMapSet: new NoiseMapSet(this.rect, this.seed),
            borderPoints: new PointSet(),
            shorePoints: new PointSet(),
            rect: this.rect,
        }
        this.#shorePoints = props.shorePoints
        this.#terrainLayer = new TerrainLayer(props)
        // this.erosionLayer = new ErosionLayer(this.#terrainLayer, props)
    }

    get(point) {
        // const basin = this.erosionLayer.getBasin(point)
        const isWater = this.isWater(point)
        const geomassType = this.#terrainLayer.geomassMap.getType(point)
        const geomassArea = this.#terrainLayer.geomassMap.getArea(point)
        return [
            `${Point.hash(point)}`,
            `water=${isWater}`,
            `geomassType=${geomassType}`,
            `geomassArea=${geomassArea}`,
        ].join(' | ')
    }

    isWater(point) {
        return this.#terrainLayer.isWater(point)
    }

    getTerrain(point) {
        const id = this.#terrainLayer.get(point)
        return Terrain.fromId(id)
    }

    isShore(point) {
        const wrappedPoint = this.rect.wrap(point)
        return this.#shorePoints.has(wrappedPoint)
    }

    getBasin(point) {
        return this.erosionLayer.getBasin(point)
    }

    // getBasinCount() {
    //     return this.erosionLayer.basinCount
    // }

    getErosionDirection(point) {
        return this.erosionLayer.getErosionDirection(point)
    }
}
