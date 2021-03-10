import { Matrix } from '/lib/base/matrix'
import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { BaseMap } from '/model/lib/map'
import { MapUI } from '/lib/ui/map'

import RegionMap from '/model/map/region'

import { Plate, PlateMatrix } from './plate'
import { MapDiagram } from './diagram'


const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 150, step: 1, min: 1}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1}),
    Type.number('scale', 'Scale', {default: 30, step: 1, min: 1}),
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
        const plateMap = buildPlateRegionMap(params)
        const provinceMap = buildSubPlateRegionMap(params)
        const plates = plateMap.map(region => new Plate(region))
        this.matrix = new PlateMatrix(width, height, params)
        this.plateGraph = new PlateGraph(plates)
        this.plates = plates
        // TODO: build deformations using plateMap.graph

        this.matrix2 = new Matrix(width, height, point => {
            const plateRg = plateMap.getRegion(point)
            const subplateRg = provinceMap.getRegion(point)
        })
    }

    isBorder(point) {
        return this.regionMap.isBorder(point)
    }

    get(point) {
        return this.matrix.get(point)
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
        scale: 2,
        chance: 0.3,
        growth: 1,
    })
}
