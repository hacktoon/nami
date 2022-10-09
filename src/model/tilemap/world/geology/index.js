import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { TileMap } from '/src/model/lib/tilemap'
import { UITileMap } from '/src/ui/tilemap'
import { PointSet } from '/src/lib/point/set'

import { NoiseMapSet } from './noise'
import { OceanMap } from './ocean'
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
    #oceanMap
    #erosionLayer

    constructor(params) {
        super(params)
        const props = {
            noiseMapSet: new NoiseMapSet(this.rect, this.seed),
            pointQueue: {water: [], land: []},
            borderPoints: new PointSet(),
            shorePoints: new PointSet(),
            oceanMap: new OceanMap(this.rect),
            rect: this.rect,
        }
        this.#shorePoints = props.shorePoints
        this.#oceanMap = props.oceanMap
        this.#terrainLayer = new TerrainLayer(props)
        this.#erosionLayer = new ErosionLayer(this.#terrainLayer, props)
    }

    get(point) {
        const terrain = this.getTerrain(point)
        const basin = this.#erosionLayer.getBasin(point)
        return [
            `${Point.hash(point)}`,
            `terrain=${terrain.name}`,
            `basin=${basin}`
        ].join(' | ')
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
        return this.#erosionLayer.getBasin(point)
    }

    getBasinCount() {
        return this.#erosionLayer.basinCount
    }

    getErosionDirection(point) {
        return this.#erosionLayer.getErosionDirection(point)
    }

    isOcean(point) {
        return this.#oceanMap.isOcean(point)
    }

    erosionDebug() {
        return this.#erosionLayer
    }
}
