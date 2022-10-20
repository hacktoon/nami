import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'
import { TileMapDiagram } from '/src/model/lib/tilemap'


const SCHEMA = new Schema(
    'GeologyTileMapDiagram',
    Type.boolean('showShoreline', 'Shoreline', {default: false}),
    // Type.boolean('showBasins', 'Basins', {default: false}),
    // Type.boolean('showErosion', 'Erosion flow', {default: false}),
    // Type.boolean('showNextPoints', 'Next points', {default: false}),
)


class ColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
        // this.basinColors = new Map()
        // for(let i=0; i<= tileMap.getBasinCount(); i++) {
        //     this.basinColors.set(i, new Color())
        // }
    }

    getByBasin(point) {
        const basin = this.tileMap.getBasin(point)
        return this.basinColors.get(basin)
    }

    isWater(point) {
        return this.tileMap.isWater(point)
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
        this.params = params
    }

    get(point) {
        const geotype = this.tileMap.getGeotype(point)
        if (this.params.get('showShoreline') && this.tileMap.isShore(point)) {
            return geotype.color.darken(60)
        }
        return geotype.color
    }

    getText(point) {
        if (this.params.get('showErosion')) {
            const direction = this.tileMap.getErosionDirection(point)
            if (direction) {
                return direction.symbol
            }
        }
        return ''
    }
}
