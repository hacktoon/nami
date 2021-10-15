import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Direction } from '/lib/direction'
import { Color } from '/lib/color'

import { TileMapDiagram } from '/lib/model/tilemap'


class GeologyColorMap {
    constructor(tileMap) {
        const entries = tileMap.map(plate => {
            const hex = tileMap.isOceanic(plate.id) ? '#058' : '#574'
            return [plate.id, Color.fromHex(hex)]
        })
        this.map = new Map(entries)
    }

    getByPlate(plateId) {
        return this.map.get(plateId)
    }

    getByOutline(landform) {
        return landform.water ? '#069' : '#141'
    }
}


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'GeologyTileMapDiagram',
        Type.boolean('showLandform', 'Show landforms', {default: true}),
        Type.boolean('showPlateBorder', 'Show borders', {default: false}),
        Type.boolean('showDirection', 'Show directions', {default: false}),
        Type.boolean('showErosion', 'Show erosion', {default: true}),
        Type.boolean('showOutline', 'Show outline', {default: true}),
    )
    static colorMap = GeologyColorMap

    static create(tileMap, colorMap, params) {
        return new GeologyTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showPlateBorder = params.get('showPlateBorder')
        this.showLandform = params.get('showLandform')
        this.showDirection = params.get('showDirection')
        this.showErosion = params.get('showErosion')
        this.showOutline = params.get('showOutline')
    }

    get(point) {
        const plateId = this.tileMap.getPlate(point)
        const erodedlandform = this.tileMap.getErodedLandform(point)
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        let color = this.colorMap.getByPlate(plateId)

        if (this.showLandform) {
            const landform = this.tileMap.getLandform(point)
            color = Color.fromHex(landform.color)
            if (this.showErosion) {
                color = Color.fromHex(erodedlandform.color)
            }
        }
        if (this.showOutline) {
            return this.colorMap.getByOutline(erodedlandform)
        }
        if (this.showPlateBorder && isBorderPoint) {
            color = color.average(Color.fromHex('#F00'))
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

    // getMark(point) {
    //     const plate = this.tileMap.getPlate(point)
    //     if (this.tileMap.isRegionOrigin(point)) {
    //         return Color.fromHex(plate.color).brighten(50).toHex()
    //     }
    // }
}
