import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Direction } from '/lib/base/direction'
import { Color } from '/lib/base/color'

import { TileMapDiagram } from '/lib/model/tilemap'


class GeologyColorMap {
    constructor(regionMap) {
        const entries = regionMap.map(region => [region.id, new Color()])
        this.map = new Map(entries)
    }

    get(region) {
        return this.map.get(region.id) || Color.fromHex('#FFF')
    }

    getMix([firstRegion, ...regions]) {
        let color = this.get(firstRegion)
        regions.forEach(region => {
            color = color.average(this.get(region))
        })
        return color
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
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        const plate = this.tileMap.getPlate(point)
        let color = Color.fromHex(plate.color)
        const erodedlandform = this.tileMap.getErodedLandform(point)

        if (this.showLandform) {
            const landform = this.tileMap.getLandform(point)
            color = Color.fromHex(landform.color)
            if (isBorderPoint) {
                color = Color.fromHex(landform.color ?? plate.color)
            }
            if (this.showErosion) {
                color = Color.fromHex(erodedlandform.color)
            }
        }
        if (this.showOutline) {
            return erodedlandform.water ? '#069' : '#141'
        }
        if (this.showPlateBorder && isBorderPoint) {
            color = color.average(Color.fromHex('#F00'))
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
