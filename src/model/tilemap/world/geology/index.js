import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMap } from '/model/lib/tilemap'
import { UITileMap } from '/ui/tilemap'

import { DeformModel } from './model'
import { GeologyTileMapDiagram } from './diagram'


const SCHEMA = new Schema(
    'GeologyTileMap',
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 30, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 30, step: 1, min: 1, max: 100}),
    Type.text('seed', 'Seed', {default: ''})
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
        this.model = new DeformModel(this.seed, params)
        this.regionGroupTileMap = this.model.regionGroupTileMap
        this.plates = this.model.plates
    }

    get(point) {
        const plate = this.getPlate(point)
        const region = this.regionGroupTileMap.getRegion(point)
        const stress = this.getStress(point)
        let str = `ID: ${plate.id}, region: ${region.id}`
        str += `, stress: ${stress}`
        if (this.hasDeform(point)) {
            const deform = this.getDeform(point)
            str += `, id: ${deform.id}, deform: ${deform.name}`
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

    getDeform(point) {
        const region = this.regionGroupTileMap.getRegion(point)
        return this.model.deformRegionMap.get(region.id)
    }

    hasDeform(point) {
        const region = this.regionGroupTileMap.getRegion(point)
        return this.model.deformRegionMap.has(region.id)
    }

    getStress(point) {
        const region = this.regionGroupTileMap.getRegion(point)
        return this.model.stressMap.get(region.id)
    }

    isMaxStress(point) {
        return this.model.isMaxStress(point)
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
