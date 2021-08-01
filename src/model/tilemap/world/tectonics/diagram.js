import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Direction } from '/lib/base/direction'
import { Color } from '/lib/base/color'

import { TileMapDiagram } from '/model/lib/tilemap'


export class TectonicsTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'TectonicsTileMapDiagram',
        Type.boolean('showDeform', 'Show deforms', {default: true}),
        Type.boolean('showPlateBorders', 'Show borders', {default: false}),
        Type.boolean('showDirections', 'Show directions', {default: false}),
        Type.boolean('showStress', 'Show stress', {default: false}),
        Type.boolean('showHotspots', 'Show hotspots', {default: false}),
    )

    static create(tileMap, params) {
        return new TectonicsTileMapDiagram(tileMap, params)
    }

    constructor(tileMap, params) {
        super(tileMap)
        this.showPlateBorders = params.get('showPlateBorders')
        this.showDeform = params.get('showDeform')
        this.showDirections = params.get('showDirections')
        this.showStress = params.get('showStress')
        this.showHotspots = params.get('showHotspots')
    }

    get(point) {
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        const stress = this.tileMap.getStress(point)
        const plate = this.tileMap.getPlate(point)
        let hex = plate.color

        if (this.showHotspots && this.tileMap.isMaxStress(point)) {
            return plate.isContinental() ? '#d1610e' : '#1c7816'
        }
        if (this.showDeform) {
            if (this.tileMap.hasDeform(point)) {
                const deform = this.tileMap.getDeform(point)
                hex = deform.color
                if (isBorderPoint) {
                    hex = deform.border ?? plate.color
                }
            }
        }
        if (this.showPlateBorders && isBorderPoint) {
            return Color.fromHex(hex).average(Color.fromHex('#F00')).toHex()
        }
        if (this.showStress) {
            if (plate.isContinental())
                return Color.fromHex(hex).brighten(stress * 3).toHex()
            return Color.fromHex(hex).darken(stress * 2).toHex()
        }
        return hex
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
