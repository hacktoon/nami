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
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const continent = this.tileMap.continent.get(point)
        const group = this.tileMap.continent.getGroup(continent)
        let color = this.colorMap.getByContinent(continent)

        if (this.showContinentGroup) {
            color = this.colorMap.getByGroup(group)
        }
        if (this.showContinentBorder && this.tileMap.continent.isBorder(point)) {
            color = color.average(Color.BLACK).brighten(10)
        }
        return color.toHex()
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
