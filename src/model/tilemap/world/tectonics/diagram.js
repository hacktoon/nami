import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Direction } from '/lib/base/direction'
import { Color } from '/lib/base/color'

import { TileMapDiagram } from '/model/lib/tilemap'
import {
    DEFORMATION_RIFT,
    DEFORMATION_OROGENY,
    DEFORMATION_TRENCH,
    DEFORMATION_CONTINENTAL_RIFT,
    DEFORMATION_ISLAND_ARC,
    DEFORMATION_PASSIVE_MARGIN
} from './model'


export class TectonicsTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'TectonicsTileMapDiagram',
        Type.boolean('showPlateBorders', 'Show borders', {default: true}),
        Type.boolean('showDirections', 'Show directions', {default: true}),
    )

    static create(tileMap, params) {
        return new TectonicsTileMapDiagram(tileMap, params)
    }

    constructor(tileMap, params) {
        super(tileMap)
        this.showPlateBorders = params.get('showPlateBorders')
        this.showDirections = params.get('showDirections')
        // this.colorMap = new PlateColorMap(tileMap)
        this.boundaryColorMap = {
            [DEFORMATION_CONTINENTAL_RIFT]: Color.fromHex('#176113'),
            [DEFORMATION_RIFT]: Color.YELLOW,
            [DEFORMATION_OROGENY]: Color.fromHex('#a38216'),
            [DEFORMATION_TRENCH]: Color.fromHex('#003f6c'),
            [DEFORMATION_PASSIVE_MARGIN]: Color.fromHex('#058'),
            [DEFORMATION_ISLAND_ARC]: Color.fromHex('#10ffae'),
        }
    }

    get(point) {
        const plate = this.tileMap.getPlate(point)
        // const region = this.tileMap.model.regionGroupTileMap.getRegion(point)
        // const isBorderPoint = this.tileMap.isPlateBorder(point)
        const isContinental = plate.isContinental()
        let color = Color.fromHex('#058')  // ocean

        if (isContinental) color = Color.fromHex('#26a11f')
        if (this.showPlateBorders) {
            const boundary = this.tileMap.getDeformation(point)

            color = this.boundaryColorMap[boundary] ?? color
        }
        return color.toHex()
    }

    getText(point) {
        const plate = this.tileMap.getPlate(point)
        if (this.showDirections && plate.origin.equals(point)) {
            return Direction.getSymbol(plate.direction)
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
