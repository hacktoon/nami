import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Direction } from '/lib/base/direction'
import { Color } from '/lib/base/color'

import { TileMapDiagram } from '/model/lib/tilemap'


export class ErosionTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'ErosionTileMapDiagram',
        Type.boolean('showDeform', 'Show deforms', {default: true}),
    )

    static create(tileMap, params) {
        return new ErosionTileMapDiagram(tileMap, params)
    }

    constructor(tileMap, params) {
        super(tileMap)
        this.showDeform = params.get('showDeform')
    }

    get(point) {
        return '#000'
    }
}
