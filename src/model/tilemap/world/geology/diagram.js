import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Direction } from '/lib/base/direction'
import { Color } from '/lib/base/color'

import { TileMapDiagram } from '/lib/model/tilemap'


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'GeologyTileMapDiagram',
        Type.boolean('showLandform', 'Show landforms', {default: true}),
        Type.boolean('showPlateBorder', 'Show borders', {default: false}),
        Type.boolean('showDirection', 'Show directions', {default: false}),
        Type.boolean('showErosion', 'Show erosion', {default: true}),
        Type.boolean('showOutline', 'Show outline', {default: true}),
    )

    static create(tileMap, params) {
        return new GeologyTileMapDiagram(tileMap, params)
    }

    constructor(tileMap, params) {
        super(tileMap)
        this.showPlateBorder = params.get('showPlateBorder')
        this.showLandform = params.get('showLandform')
        this.showDirection = params.get('showDirection')
        this.showErosion = params.get('showErosion')
        this.showOutline = params.get('showOutline')
    }

    get(point) {
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        const plate = this.tileMap.getPlate(point)
        const landform = this.tileMap.getErodedLandform(point)
        let color = Color.fromHex(plate.color)

        if (this.showLandform) {
            color = Color.fromHex(landform.color)
            if (isBorderPoint) {
                color = Color.fromHex(landform.color ?? plate.color)
            }
            if (this.showErosion) {
                const landform = this.tileMap.getErodedLandform(point)
                color = Color.fromHex(landform.color)
            }
        }
        if (this.showPlateBorder && isBorderPoint) {
            color = color.average(Color.fromHex('#F00'))
        }
        if (this.showOutline) {
            return landform.water ? '#069' : '#141'
        }
        return color.toHex()
    }

    getText(point) {
        const plate = this.tileMap.getPlate(point)
        if (this.showDirection && this.tileMap.isPlateOrigin(plate, point)) {
            const dir = Direction.getSymbol(plate.direction)
            const dirName = Direction.getName(plate.direction)
            return `${plate.id}:${dir}${dirName}`
        }
    }

    // getMark(point) {
    //     const plate = this.tileMap.getPlate(point)
    //     if (this.tileMap.isRegionOrigin(point)) {
    //         return Color.fromHex(plate.color).brighten(50).toHex()
    //     }
    // }
}
