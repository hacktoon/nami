import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'
import { TileMapDiagram } from '/src/model/lib/tilemap'


const SCHEMA = new Schema(
    'GeologyTileMapDiagram',
    Type.boolean('showShoreline', 'Shoreline', {default: false}),
    Type.boolean('showBasins', 'Basins', {default: false}),
    Type.boolean('showErosion', 'Erosion flow', {default: false}),
    Type.boolean('showNextPoints', 'Next points', {default: false}),
)


class ColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
        this.basinColors = new Map()
        for(let i=0; i<= tileMap.getBasinCount(); i++) {
            this.basinColors.set(i, new Color())
        }
    }

    getByBasin(point) {
        const basin = this.tileMap.getBasin(point)
        return this.basinColors.get(basin)
    }

    getByTerrain(point) {
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
        this.params = params
    }

    get(point) {
        const terrainColor = this.colorMap.getByTerrain(point)
        const nextPoints = this.tileMap.erosionLayer.nextPoints
        if (this.params.get('showShoreline') && this.tileMap.isShore(point)) {
            return terrainColor.darken(120)
        }
        if (this.params.get('showBasins')) {
            if (this.tileMap.getBasin(point)) {
                return this.colorMap.getByBasin(point)
            }
            return terrainColor.grayscale()
        }
        if (this.params.get('showNextPoints') && nextPoints.has(point)) {
            return terrainColor.brighten(120)
        }
        return terrainColor
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
