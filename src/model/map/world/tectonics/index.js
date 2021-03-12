import { Matrix } from '/lib/base/matrix'
import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { BaseMap } from '/model/lib/map'
import { MapUI } from '/lib/ui/map'

import RegionMap from '/model/map/region'

import { MapDiagram } from './diagram'
import { Plate } from './plate'


const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 150, step: 1, min: 1}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1}),
    Type.number('scale', 'Scale', {default: 30, step: 1, min: 1}),
    Type.number('subscale', 'Subscale', {default: 6, step: 1, min: 1}),
    Type.text('seed', 'Seed', {default: ''})
)


export default class TectonicsMap extends BaseMap {
    static id = 'Tectonics map'
    static diagram = MapDiagram
    static schema = SCHEMA
    static ui = MapUI

    static create(params) {
        return new TectonicsMap(params)
    }

    constructor(params) {
        super(params)
        const [width, height] = params.get('width', 'height')
        this.regionMap = buildPlateRegionMap(params)
        this.subregionMap = buildSubPlateRegionMap(params)
        this.plates = this.regionMap.map(region => new Plate(region.id, region.area))
        this.matrix = new Matrix(width, height, point => {

        })
        this.graph = new PlateGraph()
        this.plateIndex = {}

        // TODO: build deformations using this.plateMap.graph

        // this.matrix = new PlateMatrix(width, height, point => {
        //    this.regionMap.get(point)
        //    this.subregionMap.get(point)
        // })
    }

    getPlate(point) {
        const region = this.regionMap.getRegion(point)
        return this.plates[region.id]
    }

    getProvince(point) {
        const region = this.subregionMap.getRegion(point)
        return this.plates[region.id]
    }

    isPlateBorder(point) {
        return this.regionMap.isBorder(point)
    }

    isProvinceBorder(point) {
        return this.subregionMap.isBorder(point)
    }

    map(callback) {
        return this.plates.map(plate => callback(plate))
    }
}


class PlateGraph {
    constructor(plates) {

    }
}


function buildPlateRegionMap(params) {
    return RegionMap.fromData({
        width: params.get('width'),
        height: params.get('height'),
        scale: params.get('scale'), // 30
        seed: params.get('seed'),
        chance: 0.3,
        growth: 20,
    })
}


function buildSubPlateRegionMap(params) {
    return RegionMap.fromData({
        width: params.get('width'),
        height: params.get('height'),
        seed: params.get('seed'),
        scale: params.get('subscale'),
        chance: 0.2,
        growth: 1,
    })
}
