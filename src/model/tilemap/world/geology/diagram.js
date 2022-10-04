import { Schema } from '/src/lib/schema'
import { Color } from '/src/lib/color'
import { Type } from '/src/lib/type'
import { TileMapDiagram } from '/src/lib/model/tilemap'


const SCHEMA = new Schema(
    'GeologyTileMapDiagram',
    Type.boolean('showShoreline', 'Show shoreline', {default: false}),
    Type.boolean('showOceans', 'Show oceans', {default: false}),
)


class ColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
    }

    getTerrain(point) {
        const outline = this.tileMap.getTerrain(point)
        return outline.color
    }
}


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA
    static colorMap = ColorMap

    static create(tileMap, colorMap, params) {
        return new GeologyTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showShoreline = params.get('showShoreline')
        this.showOceans = params.get('showOceans')
    }

    get(point) {
        const terrain = this.tileMap.getTerrain(point)
        const color = this.colorMap.getTerrain(point)
        if (this.showOceans && this.tileMap.isOcean(point)) {
            return color.darken(60)
        }
        if (this.showShoreline && this.tileMap.isShore(point)) {
            return color.average(Color.RED).average(color)
        }
        return color
    }
}
