import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMap } from '/model/lib/tilemap'
import { UITileMap } from '/ui/tilemap'

import { TectonicsModel } from './model'
import { GeologyTileMapDiagram } from './diagram'
import { Boundary } from './boundary'


const SCHEMA = new Schema(
    'GeologyTileMap',
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 30, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 30, step: 1, min: 1, max: 100}),
    Type.text('seed', 'Seed', {default: '1625099321114'})
)


export class GeologyTileMap extends TileMap {
    static id = 'GeologyTileMap'
    static diagram = GeologyTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new GeologyTileMap(params)
    }

    constructor(params) {
        super(params)
        this.model = new TectonicsModel(this.seed, params)
        this.regionGroupTileMap = this.model.regionGroupTileMap
        this.plates = this.model.plates
    }

    get(point) {
        const plate = this.getPlate(point)
        const region = this.regionGroupTileMap.getRegion(point)
        const boundary = this.getBoundary(point)
        const stress = this.getStress(point)
        let str = `ID: ${plate.id}, region: ${region.id}`
            str += `, type:${plate.type}, stress: ${stress}`
            if (boundary) {
                str += `, boundary:${Boundary.getName(boundary)}`
            }
        return str
    }

    getPlate(point) {
        const group = this.regionGroupTileMap.getGroup(point)
        return this.plates.get(group.id)
    }

    isPlateOrigin(plate, point) {
        const matrix = this.regionGroupTileMap.regionTileMap.regionMatrix
        return plate.origin.equals(matrix.wrap(point))
    }

    isPlateBorder(point) {
        return this.regionGroupTileMap.isGroupBorder(point)
    }

    getBoundary(point) {
        const region = this.regionGroupTileMap.getRegion(point)
        return this.model.regionBoundary.get(region.id)
    }

    getStress(point) {
        const region = this.regionGroupTileMap.getRegion(point)
        return this.model.stressLevels.get(region.id)
    }

    getDescription() {
        return `${this.plates.size} plates`
    }

    map(callback) {
        return this.model.map(plate => callback(plate))
    }

    forEach(callback) {
        this.model.forEach(callback)
    }
}
