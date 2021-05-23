import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
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
    )

    static create(tileMap, params) {
        return new TectonicsTileMapDiagram(tileMap, params)
    }

    constructor(tileMap, params) {
        super(tileMap)
        this.showPlateBorders = params.get('showPlateBorders')
        // this.colorMap = new PlateColorMap(tileMap)
        this.deformColorMap = {
            [DEFORMATION_CONTINENTAL_RIFT]: Color.fromHex('#176113'),
            [DEFORMATION_RIFT]: Color.YELLOW,
            [DEFORMATION_OROGENY]: Color.fromHex('#a38216'),
            [DEFORMATION_TRENCH]: Color.fromHex('#003f6c'),
            [DEFORMATION_PASSIVE_MARGIN]: Color.fromHex('#058'),
            [DEFORMATION_ISLAND_ARC]: Color.fromHex('#10ffae'),
        }
    }

    get(point) {
        // const plate = this.tileMap.getPlate(point)
        const geology = this.tileMap.getGeology(point)
        const region = this.tileMap.model.regionGroupTileMap.getRegion(point)
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        let color = Color.fromHex('#058')  // ocean
        if (geology === 1) color = Color.fromHex('#26a11f') // continent
        if (this.showPlateBorders) {
            const deformation = this.tileMap.getDeformation(point)
            if (geology == 1 && deformation == DEFORMATION_OROGENY && isBorderPoint) {
                return color.toHex()
            }
            color = this.deformColorMap[deformation] ?? color
            return color.toHex()
        }
        return color.toHex()
    }

    getText(point) {
        const plate = this.tileMap.getPlate(point)
        return 'Opa'
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
