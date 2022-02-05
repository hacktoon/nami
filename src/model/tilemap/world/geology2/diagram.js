import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Color } from '/lib/color'

import { TileMapDiagram } from '/lib/model/tilemap'

const LAND_COLOR = Color.fromHex('#574')
const OCEAN_COLOR = Color.fromHex('#047')


class GeologyColorMap {
    #continentColorMap

    constructor(tileMap) {
        const continentColors = tileMap.map(continent => {
            const isOceanic = tileMap.continent.isOceanic(continent)
            const color = isOceanic ? OCEAN_COLOR : LAND_COLOR.average(new Color())
            return [continent, color]
        })
        this.tileMap = tileMap
        this.#continentColorMap = new Map(continentColors)
    }

    getByContinent(continent) {
        return this.#continentColorMap.get(continent)
    }
}


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'GeologyTileMapDiagram',
        Type.boolean('showContinentBorder', 'Continent borders', {default: true}),
        Type.boolean('showProvinceBorder', 'Province borders', {default: true}),
    )
    static colorMap = GeologyColorMap

    static create(tileMap, colorMap, params) {
        return new GeologyTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showContinentBorder = params.get('showContinentBorder')
        this.showProvinceBorder = params.get('showProvinceBorder')
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const continent = this.tileMap.continent.get(point)
        const isBorderPoint = this.tileMap.continent.isBorder(point)
        const isProvinceBorder = this.tileMap.province.isBorder(point)
        let color = this.colorMap.getByContinent(continent)

        if (this.showProvinceBorder && isProvinceBorder) {
            color = color.brighten(20)
        }
        if (this.showContinentBorder && isBorderPoint) {
            color = color.average(Color.BLACK).brighten(10)
        }
        return color.toHex()
    }

    getText(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const continent = this.tileMap.continent.get(point)
        if (this.tileMap.continent.isOrigin(point)) {
            return `${continent}`
        }
    }
}
