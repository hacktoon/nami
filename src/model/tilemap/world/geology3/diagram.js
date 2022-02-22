import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'

import { TileMapDiagram } from '/src/lib/model/tilemap'


class GeologyColorMap {
    #groupColorMap

    constructor(tileMap) {
        const groupColors = tileMap.continent.groups.map(group => {
            return [group, new Color()]
        })
        this.tileMap = tileMap
        this.#groupColorMap = new Map(groupColors)
    }

    getByContinent(continent) {
        const isOceanic = this.tileMap.continent.isOceanic(continent)
        return Color.fromHex(isOceanic ? '#047' : '#574')
    }

    getByGroup(group) {
        return this.#groupColorMap.get(group)
    }
}


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'Geology3TileMapDiagram',
        Type.boolean('showId', 'Continent id', {default: true}),
        Type.boolean('showContinentGroup', 'Continent groups', {default: true}),
        Type.boolean('showContinentBorder', 'Continent border', {default: true}),
        Type.boolean('showNoise', 'Noise', {default: true}),
        Type.boolean('showSurface', 'Surface', {default: true}),
    )
    static colorMap = GeologyColorMap

    static create(tileMap, colorMap, params) {
        return new GeologyTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showId = params.get('showId')
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
        if (this.showNoise) {
            const colorId = this.tileMap.surface.getNoise(point)
            color = new Color(colorId, colorId, colorId)
        }
        if (this.showSurface) {
            const colorId = this.tileMap.surface.get(point)
            color = new Color(colorId, colorId, colorId)
        }
        if (this.showContinentGroup) {
            color = this.colorMap.getByGroup(group)
        }
        if (this.showContinentBorder && this.tileMap.continent.isBorder(point)) {
            color = color.invert()
        }
        return color
    }

    getText(_point) {
        if (! this.showId)
            return ''
        const point = this.tileMap.rect.wrap(_point)
        const continent = this.tileMap.continent.get(point)
        const group = this.tileMap.continent.getGroup(continent)
        if (this.tileMap.continent.isOrigin(point)) {
            return `g${group}:${continent}`
        }
    }
}
