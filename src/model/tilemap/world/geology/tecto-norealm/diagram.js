import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Direction } from '/lib/direction'
import { Color } from '/lib/color'

import { TileMapDiagram } from '/lib/model/tilemap'


class TectonicsColorMap {
    constructor(tileMap) {
        const plateColors = tileMap.map(plateId => {
            const hex = tileMap.isPlateOceanic(plateId) ? '#058' : '#574'
            return [plateId, Color.fromHex(hex)]
        })
        const provinceColors = tileMap.getProvinces().map(id => {
            return [id, new Color()]
        })
        this.tileMap = tileMap
        this.plateColorMap = new Map(plateColors)
        this.provinceColorMap = new Map(provinceColors)
    }

    getByPlate(plateId) {
        return this.plateColorMap.get(plateId)
    }

    getByProvince(provinceId) {
        return this.provinceColorMap.get(provinceId)
    }
}


export class TectonicsNoRealmTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'TectonicsNoRealmTileMapDiagram',
        Type.boolean('showDirection', 'Show directions', {default: false}),
        Type.boolean('showPlateBorder', 'Show plate borders', {default: true}),
        Type.boolean('showProvince', 'Show province', {default: false}),
        Type.boolean('showProvinceLevel', 'Show province level', {default: false}),
        Type.boolean('showProvinceBorder', 'Show province border', {default: false}),
        Type.boolean('showDeformation', 'Show deformation', {default: false}),
    )
    static colorMap = TectonicsColorMap

    static create(tileMap, colorMap, params) {
        return new TectonicsNoRealmTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showPlateBorder = params.get('showPlateBorder')
        this.showDirection = params.get('showDirection')
        this.showProvince = params.get('showProvince')
        this.showProvinceLevel = params.get('showProvinceLevel')
        this.showProvinceBorder = params.get('showProvinceBorder')
        this.showDeformation = params.get('showDeformation')
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const plateId = this.tileMap.getPlate(point)
        const province = this.tileMap.getProvince(point)
        const provinceLevel = this.tileMap.getProvinceLevel(point)
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        const isProvinceBorder = this.tileMap.isProvinceBorder(point)
        const hasDeformation = this.tileMap.hasDeformation(point)
        let color = this.colorMap.getByPlate(plateId)

        if (this.showProvince) {
            const provinceColor = this.colorMap.getByProvince(province.id)
            color = provinceColor.average(color).average(color)
        }
        if (this.showProvinceLevel) {
            color = color.darken(provinceLevel * 4)
        }
        if (this.showProvinceBorder && isProvinceBorder && ! isBorderPoint) {
            color = color.brighten(20)
        }
        if (this.showPlateBorder && isBorderPoint) {
            color = color.average(Color.BLACK)
        }
        if (this.showDeformation && hasDeformation) {
            color = color.darken(40)
        }
        return color.toHex()
    }

    getText(point) {
        const plateId = this.tileMap.getPlate(point)
        const plateDirection = this.tileMap.getPlateDirection(point)
        if (this.showDirection && this.tileMap.isPlateOrigin(plateId, point)) {
            const dir = Direction.getSymbol(plateDirection)
            const dirName = Direction.getName(plateDirection)
            return `${plateId}:${dir}${dirName}`
        }
    }

    getMark(point) {
        if (this.tileMap.isRegionOrigin(point)) {
            const plateId = this.tileMap.getPlate(point)
            return this.colorMap.getByPlate(plateId).darken(50).toHex()
        }
    }
}
