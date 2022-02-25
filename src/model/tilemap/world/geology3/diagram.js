import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'

import { TileMapDiagram } from '/src/lib/model/tilemap'


class GeologyColorMap {
    #groupColorMap

    constructor(tileMap) {
        this.tileMap = tileMap
        this.#groupColorMap = new Map(tileMap.continent.groups.map(group => {
            return [group, new Color()]
        }))
    }

    getByGroup(group) {
        return this.#groupColorMap.get(group)
    }

    getByContinent(continent) {
        const isOceanic = this.tileMap.continent.isOceanic(continent)
        return Color.fromHex(isOceanic ? '#047' : '#574')
    }
}


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'Geology3TileMapDiagram',
        Type.boolean('showContinentBorder', 'Continent border', {default: false}),
        Type.boolean('showContinentGroup', 'Continent groups', {default: false}),
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
        this.showContinentGroup = params.get('showContinentGroup')
        this.showNoise = params.get('showNoise')
        this.showSurface = params.get('showSurface')
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const continent = this.tileMap.continent.get(point)
        const group = this.tileMap.continent.getGroup(continent)
        let color = this.colorMap.getByContinent(continent)

        color = color.darken(2 * this.tileMap.surface.getLevel(point))
        if (this.showSurface) {
            const feature = this.tileMap.surface.getFeature(point)
            color = Color.fromHex(feature.color)
        }
        if (this.showContinentGroup) {
            color = this.colorMap.getByGroup(group)
        }
        if (this.showContinentBorder && this.tileMap.continent.isBorder(point)) {
            color = color.average(Color.BLACK)
        }
        return color
    }
}
