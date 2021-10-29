import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Direction } from '/lib/direction'
import { Color } from '/lib/color'

import { TileMapDiagram } from '/lib/model/tilemap'


class GeologyColorMap {
    constructor(tileMap) {
        const plateColors = tileMap.map(plateId => {
            const hex = tileMap.isOceanic(plateId) ? '#058' : '#574'
            return [plateId, Color.fromHex(hex)]
        })
        this.map = new Map(plateColors)
        const boundaryColors = tileMap.getBoundaries().map(boundaryId => {
            return [boundaryId, new Color()]
        })
        this.boundaryMap = new Map(boundaryColors)
    }

    getByPlate(plateId) {
        return this.map.get(plateId)
    }

    getByBoundary(id) {
        return this.boundaryMap.get(id)
    }

    getByOutline(landform) {
        return landform.water ? '#069' : '#141'
    }
}


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'GeologyTileMapDiagram',
        Type.boolean('showDirection', 'Show directions', {default: false}),
        Type.boolean('showBoundary', 'Show boundary', {default: true}),
        Type.boolean('showPlateBorder', 'Show borders', {default: false}),
        Type.boolean('showLandform', 'Show landforms', {default: true}),
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
        this.showBoundary = params.get('showBoundary')
    }

    get(point) {
        const plateId = this.tileMap.getPlate(point)
        const erodedlandform = this.tileMap.getErodedLandform(point)
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        const boundaryId = this.tileMap.getBoundary(point)
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
        if (this.showBoundary) {
            const stress = this.tileMap.getStress(point)
            color = this.colorMap.getByBoundary(boundaryId).darken(stress * 10)
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
