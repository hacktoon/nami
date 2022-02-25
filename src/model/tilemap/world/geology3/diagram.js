import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'

import { TileMapDiagram } from '/src/lib/model/tilemap'


class GeologyColorMap {
    #continentColorMap

    constructor(tileMap) {
        this.tileMap = tileMap
        this.#continentColorMap = new Map(tileMap.continent.ids.map(continent => {
            return [continent, new Color()]
        }))
    }

    getByContinent(continent) {
        return this.#continentColorMap.get(continent)
    }

    getByPlate(plate) {
        const isOceanic = this.tileMap.continent.isOceanic(plate)
        return Color.fromHex(isOceanic ? '#047' : '#574')
    }
}


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'Geology3TileMapDiagram',
        Type.boolean('showContinentBorder', 'Continent border', {default: false}),
        Type.boolean('showContinent', 'Continent', {default: false}),
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
        this.showContinent = params.get('showContinent')
        this.showNoise = params.get('showNoise')
        this.showSurface = params.get('showSurface')
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const plate = this.tileMap.continent.getPlate(point)
        const continent = this.tileMap.continent.get(plate)
        const level = this.tileMap.surface.getLevel(point)
        let color = this.colorMap.getByPlate(plate).darken(2 * level)

        if (this.showContinent) {
            color = this.colorMap.getByContinent(continent)
        }
        if (this.showSurface) {
            const feature = this.tileMap.surface.getFeature(point)
            color = Color.fromHex(feature.color)
        }
        if (this.showContinentBorder && this.tileMap.continent.isBorder(point)) {
            color = color.average(Color.BLACK)
        }
        return color
    }
}
