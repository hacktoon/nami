import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Direction } from '/lib/base/direction'
import { Color } from '/lib/base/color'

import { TileMapDiagram } from '/model/lib/tilemap'


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'GeologyTileMapDiagram',
        Type.boolean('showBoundaries', 'Show boundaries', {default: true}),
        Type.boolean('showPlateBorders', 'Show borders', {default: false}),
        Type.boolean('showDirections', 'Show directions', {default: false}),
    )

    static create(tileMap, params) {
        return new GeologyTileMapDiagram(tileMap, params)
    }

    constructor(tileMap, params) {
        super(tileMap)
        this.showPlateBorders = params.get('showPlateBorders')
        this.showBoundaries = params.get('showBoundaries')
        this.showDirections = params.get('showDirections')
    }

    get(point) {
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        const boundary = this.tileMap.getBoundary(point)
        const stress = this.tileMap.getStress(point)
        const plate = this.tileMap.getPlate(point)
        const hex = plate.isOceanic() ? '#058' : '#1c7816'
        let color = Color.fromHex(hex)

        if (this.showBoundaries) {
            if (stress >= boundary.depth && stress < boundary.energy) {
                color = Color.fromHex(boundary.color)
            }
            if (isBorderPoint) {
                color = Color.fromHex(hex)
                if (boundary.hasBorder()) {
                    color = Color.fromHex(boundary.border)
                }
            }
        }
        if (this.showPlateBorders && isBorderPoint) {
            return color.average(Color.fromHex('#F00')).toHex()
        }
        if (plate.isContinental())
            return color.brighten(stress * 5).toHex()
        return color.darken(stress * 3).toHex()
    }

    getText(point) {
        const plate = this.tileMap.getPlate(point)
        if (this.showDirections && this.tileMap.isPlateOrigin(plate, point)) {
            const dir = Direction.getSymbol(plate.direction)
            const dirName = Direction.getName(plate.direction)
            return `${plate.id}:${dir}${dirName}`
        }
    }
}


class PlateColorMap {
    constructor(tileMap) {
        const entries = tileMap.map(plate => {
            let color =  new Color(0, 250, 0).average(plate.color)
            if (plate.isOceanic()) {
                color = new Color(0, 0, 150)
            }
            return [plate.id, color]
        })
        this.map = Object.fromEntries(entries)
    }

    get(plate) {
        return this.map[plate.id]
    }
}
