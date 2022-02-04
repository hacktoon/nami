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
            const color = continent % 2 ? OCEAN_COLOR : LAND_COLOR.average(new Color())
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
    )
    static colorMap = GeologyColorMap

    static create(tileMap, colorMap, params) {
        return new GeologyTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showContinentBorder = params.get('showContinentBorder')
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const continent = this.tileMap.getContinent(point)
        const isBorderPoint = this.tileMap.isContinentBorder(point)
        let color = this.colorMap.getByContinent(continent)

        if (this.showContinentBorder && isBorderPoint) {
            color = color.average(Color.BLACK).brighten(10)
        }
        return color.toHex()
    }

    getText(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const continent = this.tileMap.getContinent(point)
        if (this.tileMap.isContinentOrigin(point)) {
            return `${continent}`
        }
    }
}
