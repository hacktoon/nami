import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'

import { TileMapDiagram } from '/src/lib/model/tilemap'


class GeologyColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
    }

    getByContinent(continent) {
        const isOceanic = this.tileMap.continent.isOceanic(continent)
        return Color.fromHex(isOceanic ? '#047' : '#574')
    }
}


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'Geology3TileMapDiagram',
        Type.boolean('showContinentBorder', 'Continent border', {default: true}),
        Type.boolean('showSurface', 'Surface', {default: true}),
    )
    static colorMap = GeologyColorMap

    static create(tileMap, colorMap, params) {
        return new GeologyTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showContinentBorder = params.get('showContinentBorder')
        this.showNoise = params.get('showNoise')
        this.showSurface = params.get('showSurface')
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const continent = this.tileMap.continent.get(point)
        let color = this.colorMap.getByContinent(continent)

        color = color.darken(2 * this.tileMap.surface.getLevel(point))
        if (this.showSurface) {
            const feature = this.tileMap.surface.getFeature(point)
            color = Color.fromHex(feature.color)
        }
        if (this.showContinentBorder && this.tileMap.continent.isBorder(point)) {
            color = Color.RED
        }
        return color
    }
}
