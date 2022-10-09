import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'
import { TileMapDiagram } from '/src/model/lib/tilemap'


const SCHEMA = new Schema(
    'GeologyTileMapDiagram',
    Type.boolean('showShoreline', 'Shoreline', {default: false}),
    Type.boolean('showOceans', 'Oceans', {default: false}),
    Type.boolean('showBasins', 'Basins', {default: false}),
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
        this.showShoreline = params.get('showShoreline')
        this.showOceans = params.get('showOceans')
        this.showBasins = params.get('showBasins')
    }

    get(point) {
        const terrainColor = this.colorMap.getByTerrain(point)
        const erosionLayer = this.tileMap.erosionDebug()
        if (this.showShoreline && this.tileMap.isShore(point)) {
            return terrainColor.darken(120)
        }
        if (this.showBasins) {
            // if (erosionLayer.nextPoints.has(point)) {
            //     return terrainColor.darken(120)
            // }
            if (this.tileMap.getBasin(point)) {
                return this.colorMap.getByBasin(point)
            }
            return terrainColor.grayscale()
        }
        if (this.showOceans && this.tileMap.isOcean(point)) {
            return terrainColor.darken(60)
        }
        return terrainColor
    }

    getText(point) {
        const wPoint = this.tileMap.rect.wrap(point)
        if (this.showBasins) {
            const flowTarget = this.tileMap.getFlowTarget(wPoint)
            // TODO: use stored direction
            if (flowTarget) {
                const angle = Point.angle(wPoint, flowTarget)
                const direction = Direction.fromAngle(angle)
                return direction.symbol
            }
        }
        return ''
    }
}
