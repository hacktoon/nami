import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Direction } from '/lib/base/direction'
import { Color } from '/lib/base/color'

import { TileMapDiagram } from '/model/lib/tilemap'


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'GeologyTileMapDiagram',
        Type.boolean('showLandform', 'Show landforms', {default: true}),
        Type.boolean('showPlateBorder', 'Show borders', {default: false}),
        Type.boolean('showDirection', 'Show directions', {default: false}),
        Type.boolean('showHotspot', 'Show hotspots', {default: false}),
    )

    static create(tileMap, params) {
        return new GeologyTileMapDiagram(tileMap, params)
    }

    constructor(tileMap, params) {
        super(tileMap)
        this.showPlateBorder = params.get('showPlateBorder')
        this.showLandform = params.get('showLandform')
        this.showDirection = params.get('showDirection')
        this.showHotspot = params.get('showHotspot')
    }

    get(point) {
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        const plate = this.tileMap.getPlate(point)
        let hex = plate.color

        if (this.showHotspot && plate.origin.equals(point)) {
            return '#F00'
        }
        if (this.showLandform) {
            const landform = this.tileMap.getLandform(point)
            hex = landform.color
            if (isBorderPoint) {
                hex = landform.border ?? plate.color
            }
        }
        if (this.showPlateBorder && isBorderPoint) {
            return Color.fromHex(hex).average(Color.fromHex('#F00')).toHex()
        }
        return hex
    }

    getText(point) {
        const plate = this.tileMap.getPlate(point)
        if (this.showDirection && this.tileMap.isPlateOrigin(plate, point)) {
            const dir = Direction.getSymbol(plate.direction)
            const dirName = Direction.getName(plate.direction)
            return `${plate.id}:${dir}${dirName}`
        }
    }

    getMark(point) {
        const plate = this.tileMap.getPlate(point)
        if (this.tileMap.isRegionOrigin(point)) {
            return Color.fromHex(plate.color).brighten(50).toHex()
        }
    }
}
