import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMap } from '/model/lib/tilemap'
import { UITileMap } from '/ui/tilemap'

import { TectonicsModel } from './model'
import { TectonicsTileMapDiagram } from './diagram'
import { Boundary } from './boundary'


const SCHEMA = new Schema(
    'TectonicsTileMap',
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 30, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 30, step: 1, min: 1, max: 100}),
    Type.text('seed', 'Seed', {default: '1624736690535'})
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
        this.model = new TectonicsModel(this.seed, params)
    }

    get(point) {
        const plate = this.getPlate(point)
        const region = this.model.regionGroupTileMap.getRegion(point)
        const boundary = this.getBoundary(point)
        const stress = this.getStress(point)
        let str = `ID: ${plate.id}, region: ${region.id}`
            str += `, type:${plate.type}, stress: ${stress}`
            if (boundary) {
                str += `, boundary:${Boundary.getName(boundary)}`

            }
        return str
    }

    getPlateCount() {
        return this.model.plates.size()
    }

    getPlate(point) {
        const group = this.model.regionGroupTileMap.getGroup(point)
        return this.model.plates.get(group.id)
    }

    isPlateBorder(point) {
        return this.model.regionGroupTileMap.isGroupBorder(point)
    }

    getBoundary(point) {
        const region = this.model.regionGroupTileMap.getRegion(point)
        return this.model.boundaries.get(region.id)
    }

    getStress(point) {
        const region = this.model.regionGroupTileMap.getRegion(point)
        return this.model.stressLevels.get(region.id)
    }

    map(callback) {
        return this.model.map(plate => callback(plate))
    }

    forEach(callback) {
        this.model.forEach(callback)
    }
}
