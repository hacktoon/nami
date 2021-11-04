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
        const provinceColors = tileMap.getProvinces().map(boundaryId => {
            return [boundaryId, new Color()]
        })
        this.map = new Map(plateColors)
        this.provinceMap = new Map(provinceColors)
    }

    getByPlate(plateId) {
        return this.map.get(plateId)
    }

    getByProvince(id) {
        return this.provinceMap.get(id)
    }

    getByOutline(deformation) {
        return deformation.water ? '#069' : '#141'
    }
}


export class TectonicsTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'TectonicsTileMapDiagram',
        Type.boolean('showDirection', 'Show directions', {default: false}),
        Type.boolean('showProvince', 'Show province', {default: true}),
        Type.boolean('showPlateBorder', 'Show borders', {default: false}),
        Type.boolean('showDeformation', 'Show deformations', {default: true}),
        Type.boolean('showOutline', 'Show outline', {default: true}),
    )
    static colorMap = TectonicsColorMap

    static create(tileMap, colorMap, params) {
        return new TectonicsTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showPlateBorder = params.get('showPlateBorder')
        this.showDeformation = params.get('showDeformation')
        this.showDirection = params.get('showDirection')
        this.showOutline = params.get('showOutline')
        this.showProvince = params.get('showProvince')
    }

    get(point) {
        const plateId = this.tileMap.getPlate(point)
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        const boundaryId = this.tileMap.getBoundary(point)
        let color = this.colorMap.getByPlate(plateId)
        const deformation = this.tileMap.getDeformation(point)

        if (this.showDeformation) {
            color = Color.fromHex(deformation.color)
        }
        if (this.showOutline) {
            return this.colorMap.getByOutline(deformation)
        }
        if (this.showProvince) {
            color = this.colorMap.getByProvince(boundaryId)
        }
        if (this.showPlateBorder && isBorderPoint) {
            color = color.average(Color.fromHex('#000'))
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
