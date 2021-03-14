import { Matrix } from '/lib/base/matrix'
import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { BaseMap } from '/model/lib/map'
import { MapUI } from '/lib/ui/map'

import SubRegionMap from '/model/map/subregion'

import { MapDiagram } from './diagram'
import { Plate } from './plate'


const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 150, step: 1, min: 1}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1}),
    Type.number('scale', 'Scale', {default: 30, step: 1, min: 1}),
    Type.number('subscale', 'Subscale', {default: 4, step: 1, min: 1}),
    Type.text('seed', 'Seed', {default: ''})
)


const NO_DEFORMATION = 0
const OROGENY = 1
const TRENCH = 2
const RIFT = 3


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
        this.subRegionMap = buildSubRegionMap(params)
        this.plates = this.subRegionMap.map(reg => new Plate(reg.id, reg.area))

        this.borderProvinceMap = {}
        this.plateMap = new Matrix(width, height, point => {
            const region = this.subRegionMap.getRegion(point)
            const subregion = this.subRegionMap.getSubRegion(point)
            if (this.subRegionMap.isRegionBorder(point)) {
                this.borderProvinceMap[subregion.id] = region.id
            }

            return NO_DEFORMATION
        })
        this.graph = new PlateGraph()
        this.plateIndex = {}
    }

    getPlate(point) {
        const region = this.subRegionMap.getRegion(point)
        return this.plates[region.id]
    }

    getProvince(point) {
        const region = this.subRegionMap.getSubRegion(point)
        return this.plates[region.id]
    }

    isPlateBorder(point) {
        return this.subRegionMap.isRegionBorder(point)
    }

    isProvinceBorder(point) {
        return this.subRegionMap.isSubRegionBorder(point)
    }

    map(callback) {
        return this.plates.map(plate => callback(plate))
    }
}


class PlateGraph {
    constructor(plates) {

    }
}


function buildSubRegionMap(params) {
    return SubRegionMap.fromData({
        width: params.get('width'),
        height: params.get('height'),
        seed: params.get('seed'),
        scale: params.get('scale'),
        chance: 0.2,
        growth: 40,
        subscale: params.get('subscale'),
        subchance: 0.1,
        subgrowth: 1,
    })
}
