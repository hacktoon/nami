import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMap } from '/model/lib/tilemap'
import { UITileMap } from '/ui/tilemap'

import { RegionGroupTileMap } from '/model/tilemap/regiongroup'

import { TectonicsTileMapDiagram } from './diagram'
import { TectonicsTable } from './plate'


const SCHEMA = new Schema(
    'TectonicsTileMap',
    Type.number('width', 'Width', {default: 150, step: 1, min: 1}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1}),
    Type.number('scale', 'Scale', {default: 34, step: 1, min: 1}),
    Type.text('seed', 'Seed', {default: ''})
)


export class TectonicsTileMap extends TileMap {
    static id = 'TectonicsTileMap'
    static diagram = TectonicsTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new TectonicsTileMap(params)
    }

    constructor(params) {
        super(params)
        const [width, height] = params.get('width', 'height')
        const regionGroupTileMap = buildRegionGroupMap(params)
        this.table = new TectonicsTable(regionGroupTileMap)
        // console.log(regionGroupTileMap.origins);
        // const isFillable = point => this.getId(point) == EMPTY
        // const onFill = point => {
        //     this._setPoint(point)
        //     tileCount++
        // }
        // new ScanlineFill(this.matrix, startPoint, onFill, isFillable).fill()
    }

    getPlate(point) {
        return this.table.getPlate(point)
    }

    map(callback) {
        return this.table.map(plate => callback(plate))
    }

    forEach(callback) {
        this.table.forEach(callback)
    }
}


function buildRegionGroupMap(params) {
    return RegionGroupTileMap.fromData({
        width: params.get('width'),
        height: params.get('height'),
        seed: params.get('seed'),
        groupScale: params.get('scale'),
        groupChance: 0.2,
        groupGrowth: 12,
        scale: 2,
        growth: 0,
        chance: 0.1,
    })
}
