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
        Type.boolean('showPlateBorder', 'Show borders', {default: true}),
        Type.boolean('showProvince', 'Show province', {default: false}),
        Type.boolean('showProvinceLevel', 'Show province level', {default: false}),
        Type.boolean('showProvinceBorder', 'Show province border', {default: false}),
        Type.number('provinceLevel', 'Province level', {min: -1, default: -1}),
        Type.number('levelReach', 'Level reach', {min: 0, default: 0}),
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
        this.provinceLevel = params.get('provinceLevel')
        this.levelReach = params.get('levelReach')
    }

    get(point) {
        const plateId = this.tileMap.getPlate(point)
        const province = this.tileMap.getProvince(point)
        const provinceLevel = this.tileMap.getProvinceLevel(point)
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        const isProvinceBorder = this.tileMap.isProvinceBorder(point)
        let color = this.colorMap.getByPlate(plateId)

        if (this.showProvince) {
            const provinceColor = this.colorMap.getByProvince(province.id)
            color = provinceColor.average(color).average(color)
            if (this.showProvinceLevel) {
                color = color.darken(provinceLevel * 4)
            }
            const maxLevel = this.levelReach + this.provinceLevel
            if (this.provinceLevel <= provinceLevel && provinceLevel <= maxLevel) {
                color = color.darken(80)
            }
        }
        if (this.showProvinceBorder && isProvinceBorder && ! isBorderPoint) {
            color = color.brighten(20)
        }
        if (this.showPlateBorder && isBorderPoint) {
            color = color.average(Color.BLACK)
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
