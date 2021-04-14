import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMap } from '/model/lib/tilemap'
import { UITileMap } from '/ui/tilemap'

import { RegionGroupTileMap } from '/model/tilemap/regiongroup'

import { TectonicsData } from './data'
import { TectonicsTileMapDiagram } from './diagram'


const SCHEMA = new Schema(
    'TectonicsTileMap',
    Type.number('width', 'Width', {default: 150, step: 1, min: 1}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1}),
    Type.number('scale', 'Scale', {default: 32, step: 1, min: 1}),
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
        const regionGroupTileMap = buildRegionGroupMap(params)
        this.data = new TectonicsData(regionGroupTileMap)
    }

    getPlate(point) {
        return this.data.getPlate(point)
    }

    isPlateBorderAt(point) {
        return this.data.isPlateBorderAt(point)
    }

    map(callback) {
        return this.data.map(plate => callback(plate))
    }

    forEach(callback) {
        this.data.forEach(callback)
    }
}


function buildRegionGroupMap(params) {
    return RegionGroupTileMap.fromData({
        width: params.get('width'),
        height: params.get('height'),
        seed: params.get('seed'),
        groupScale: params.get('scale'),
        groupChance: 0.2,
        groupGrowth: 20,
        scale: 2,
        growth: 0,
        chance: 0.1,
    })
}
