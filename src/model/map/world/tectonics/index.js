import { Matrix } from '/lib/base/matrix'
import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { BaseMap } from '/model/lib/map'
import { UIMap } from '/lib/ui/map'

import RegionGroupMap from '/model/map/regiongroup'

import { MapDiagram } from './diagram'
import { Plate } from './plate'


const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 150, step: 1, min: 1}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1}),
    Type.number('scale', 'Scale', {default: 30, step: 1, min: 1}),
    Type.number('subscale', 'Subscale', {default: 4, step: 1, min: 1}),
    Type.text('seed', 'Seed', {default: 'b'})
)


const NO_DEFORMATION = null
const OROGENY = 1
const TRENCH = 2
const RIFT = 3


export default class TectonicsMap extends BaseMap {
    static id = 'Tectonics map'
    static diagram = MapDiagram
    static schema = SCHEMA
    static ui = UIMap

    static create(params) {
        return new TectonicsMap(params)
    }

    constructor(params) {
        super(params)
        const [width, height] = params.get('width', 'height')
        this.subRegionMap = buildRegionGroupMap(params)
        this.plates = this.subRegionMap.map(reg => new Plate(reg.id, reg.area))

        this.borderProvinceTable = new Map()
        this.plateMap = new Matrix(width, height, point => {
            const province = this.subRegionMap.getSubRegion(point)
            if (this.subRegionMap.isRegionBorder(point)) {
                const borderRegion = this.subRegionMap.getBorderRegion(point)
                this.borderProvinceTable.set(province.id, borderRegion.id)
                return borderRegion.id
            }
            return NO_DEFORMATION
        })
        this.graph = new PlateGraph()
        this.plateIndex = {}
    }

    getPlate(point) {
        const plate = this.subRegionMap.getRegion(point)
        return this.plates[plate.id]
    }

    getProvince(point) {
        return this.subRegionMap.getSubRegion(point)
    }

    isPlateBorder(point) {
        return this.subRegionMap.isRegionBorder(point)
    }

    isProvinceBorder(point) {
        return this.subRegionMap.isSubRegionBorder(point)
    }

    isBorderProvinceRegion(point) {
        const province = this.getProvince(point)
        return this.borderProvinceTable.has(province.id)
    }

    getBorderProvinceRegion(point) {
        const province = this.getProvince(point)
        const id = this.borderProvinceTable.get(province.id)
        return this.plates[id]
    }

    map(callback) {
        return this.plates.map(plate => callback(plate))
    }
}


class PlateGraph {
    constructor(plates) {

    }
}


function buildRegionGroupMap(params) {
    return RegionGroupMap.fromData({
        width: params.get('width'),
        height: params.get('height'),
        seed: params.get('seed'),
        scale: params.get('scale'),
        chance: 0.2,
        growth: 40,
    })
}
