import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Direction } from '/lib/direction'
import { Color } from '/lib/color'

import { TileMapDiagram } from '/lib/model/tilemap'

const PL_LAND = '#574'
const PL_OCEAN = '#058'


class GeologyColorMap {
    constructor(tileMap) {
        const plateColors = tileMap.map(plateId => {
            const isOceanic = tileMap.isPlateOceanic(plateId)
            const hex = isOceanic ? PL_OCEAN: PL_LAND
            return [plateId, Color.fromHex(hex)]
        })
        const surfaceColors = tileMap.getSurfaces().map(id => {
            const modifier = tileMap.isContinent(id)
                ? Color.GREEN
                : Color.BLUE
            return [id, new Color().average(modifier)]
        })
        this.tileMap = tileMap
        this.plateColorMap = new Map(plateColors)
        this.surfaceColorMap = new Map(surfaceColors)
    }

    getByPlate(plateId) {
        return this.plateColorMap.get(plateId)
    }

    getBySurface(continentId) {
        return this.surfaceColorMap.get(continentId)
    }
}


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'GeologyTileMapDiagram',
        Type.boolean('showPlateBorder', 'Show plate borders', {default: true}),
        Type.boolean('showSurface', 'Show surface', {default: false}),
    )
    static colorMap = GeologyColorMap

    static create(tileMap, colorMap, params) {
        return new GeologyTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showSurface = params.get('showSurface')
        this.showPlateBorder = params.get('showPlateBorder')
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const plateId = this.tileMap.getPlate(point)
        const surface = this.tileMap.getSurface(point)
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        let color = this.colorMap.getByPlate(plateId)

        if (this.showSurface) {
            color = color.average(this.colorMap.getBySurface(surface))
        }
        if (this.showPlateBorder && isBorderPoint) {
            color = color.average(Color.BLACK).brighten(10)
        }
        return color.toHex()
    }
}
