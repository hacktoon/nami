import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMap } from '/model/lib/tilemap'
import { UITileMap } from '/ui/tilemap'

import { PlateModel } from './model'
import { GeologyTileMapDiagram } from './diagram'


const ID = 'GeologyTileMap'

const SCHEMA = new Schema(
    ID,
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 20, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 40, step: 1, min: 1, max: 100}),
    Type.text('seed', 'Seed', {default: ''})
)


export class GeologyTileMap extends TileMap {
    static id = ID
    static diagram = GeologyTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new GeologyTileMap(params)
    }

    constructor(params) {
        super(params)
        this.model = new PlateModel(this.seed, params)
        this.regionGroupTileMap = this.model.regionGroupTileMap
        this.plates = this.model.plates
    }

    get(point) {
        const plate = this.getPlate(point)
        const region = this.regionGroupTileMap.getRegion(point)
        const stress = this.getStress(point)
        const landform = this.getLandform(point)
        let str = `ID: ${plate.id}, region(${region.id})`
        str += `, stress: ${stress}, key: ${landform.key}`
        str += `, boundary: ${landform.boundary}`
        str += `, landform: ${landform.name}`
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

    getLandform(point) {
        const region = this.regionGroupTileMap.getRegion(point)
        return this.model.regionLandformMap.get(region.id)
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
