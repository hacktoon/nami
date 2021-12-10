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
        const provinceColors = tileMap.getBoundaryIds().map(boundaryId => {
            return [boundaryId, new Color()]
        })
        this.tileMap = tileMap
        this.plateColorMap = new Map(plateColors)
        this.provinceColorMap = new Map(provinceColors)
    }

    getByPlate(plateId) {
        return this.plateColorMap.get(plateId)
    }

    getByProvince(provinceId) {
        const boundaryId = this.tileMap.getBoundary(provinceId)
        return this.provinceColorMap.get(boundaryId)
    }
}


export class TectonicsTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'TectonicsTileMapDiagram',
        Type.boolean('showProvince', 'Show province', {default: false}),
        Type.boolean('showDeformation', 'Show deformations', {default: true}),
        Type.boolean('showPlateBorder', 'Show borders', {default: false}),
        Type.boolean('showDirection', 'Show directions', {default: false}),
        Type.number('showStressLevel', 'Show stress level', {default: -1, min:-1}),
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
        this.showProvince = params.get('showProvince')
        this.showStressLevel = params.get('showStressLevel')
    }

    get(point) {
        const plateId = this.tileMap.getPlate(point)
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        const provinceId = this.tileMap.getProvince(point)
        const deformation = this.tileMap.getDeformation(point)
        const stress = this.tileMap.getStress(point)
        let color = this.colorMap.getByPlate(plateId)

        if (this.showDeformation) {
            color = Color.fromHex(deformation.color)
        }
        if (this.showProvince) {
            color = this.colorMap.getByProvince(provinceId)
            if (this.showDeformation) {
                color = color.darken(stress * 5)
            }
        }
        if (this.showPlateBorder && isBorderPoint) {
            color = color.average(Color.fromHex('#000'))
        }
        if (this.showStressLevel >=0 && this.showStressLevel == stress) {
            color = color.darken(100)
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
