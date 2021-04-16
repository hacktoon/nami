import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Color } from '/lib/base/color'

import { TileMapDiagram } from '/model/lib/tilemap'


export class TectonicsTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'TectonicsTileMapDiagram',
        Type.boolean('showPlateBorders', 'Show plate borders', {default: true}),
    )

    static create(tileMap, params) {
        return new TectonicsTileMapDiagram(tileMap, params)
    }

    constructor(tileMap, params) {
        super(tileMap)
        this.showPlateBorders = params.get('showPlateBorders')
        this.colorMap = new PlateColorMap(tileMap)
    }

    get(point) {
        const plate = this.tileMap.getPlate(point)
        const isBorder = this.tileMap.isPlateBorder(point)
        const geology = this.tileMap.getGeology(point)
        let color = Color.fromHex('#058')  // ocean
        if (geology === 1) color = Color.fromHex('#26a11f') // platform
        if (geology === 2) color = Color.fromHex('#71694b') // shield

        if (this.showPlateBorders && isBorder) {
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
