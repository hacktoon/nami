import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Color } from '/lib/base/color'

import { TileMapDiagram } from '/model/lib/tilemap'
import {
    DEFORMATION_RIFT,
    DEFORMATION_OROGENY,
    DEFORMATION_TRENCH
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
    }

    get(point) {
        // const plate = this.tileMap.getPlate(point)
        const geology = this.tileMap.getGeology(point)
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        let color = Color.fromHex('#058')  // ocean
        if (geology === 1) color = Color.fromHex('#26a11f') // continent
        if (this.showPlateBorders && isBorderPoint) {
            const deformation = this.tileMap.getDeformation(point)
            if (deformation === DEFORMATION_RIFT ) {
                return '#FF0'
            }
            if (deformation === DEFORMATION_OROGENY ) {
                return '#F00'
            }
            if (deformation === DEFORMATION_TRENCH ) {
                return '#00F'
            }
            return color.darken(30).toHex()
        }

        return color.toHex()
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
