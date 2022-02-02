import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Direction } from '/lib/direction'
import { Color } from '/lib/color'

import { TileMapDiagram } from '/lib/model/tilemap'

const LAND_COLOR = Color.fromHex('#574')
const OCEAN_COLOR = Color.fromHex('#047')


class GeologyColorMap {
    constructor(tileMap) {
        const plateColors = tileMap.map(plateId => {
            const isOceanic = tileMap.isPlateOceanic(plateId)
            const color = isOceanic ? OCEAN_COLOR : LAND_COLOR.average(new Color())
            return [plateId, color]
        })
        this.tileMap = tileMap
        this.plateColorMap = new Map(plateColors)
    }

    getByPlate(plateId) {
        return this.plateColorMap.get(plateId)
    }
}


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'GeologyTileMapDiagram',
        Type.boolean('showPlateBorder', 'Show plate borders', {default: true}),
    )
    static colorMap = GeologyColorMap

    static create(tileMap, colorMap, params) {
        return new GeologyTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showPlateBorder = params.get('showPlateBorder')
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const plateId = this.tileMap.getPlate(point)
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        let color = this.colorMap.getByPlate(plateId)

        if (this.showPlateBorder && isBorderPoint) {
            color = color.average(Color.BLACK).brighten(10)
        }
        return color.toHex()
    }
}
