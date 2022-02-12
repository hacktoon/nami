import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Color } from '/lib/color'
import { Random } from '/lib/random'

import { TileMapDiagram } from '/lib/model/tilemap'

const LAND_COLOR = Color.fromHex('#574')
const OCEAN_COLOR = Color.fromHex('#047')


class GeologyColorMap {
    #continentColorMap

    constructor(tileMap) {
        const continentColors = tileMap.map(continent => {
            const isOceanic = tileMap.continent.isOceanic(continent)
            const color = isOceanic
                ? OCEAN_COLOR
                : LAND_COLOR.darken(Random.choice(0, 20, 40, 60))
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
        Type.boolean('showId', 'Continent id', {default: true}),
        Type.boolean('showContinentBorder', 'Continent border', {default: true}),
        Type.boolean('showProvinceBorder', 'Province border', {default: true}),
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
        this.showProvinceBorder = params.get('showProvinceBorder')
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const continent = this.tileMap.continent.get(point)
        const province = this.tileMap.province.get(point)
        const isContinentBorder = this.tileMap.continent.isBorder(point)
        const isProvinceBorder = this.tileMap.province.isBorder(point)
        let color = this.colorMap.getByContinent(continent)

        if (this.tileMap.province.isCorner(province)) {
            const isOceanic = this.tileMap.continent.isOceanic(continent)
            color = isOceanic ? color.brighten(20) : OCEAN_COLOR.brighten(20)
        } else if (this.tileMap.province.isBorderProvince(province)) {
            const isOceanic = this.tileMap.continent.isOceanic(continent)
            color = isOceanic ? color.brighten(20) : color.darken(10)
        }
        if (this.showProvinceBorder && isProvinceBorder) {
            color = color.brighten(20)
        }
        if (this.showContinentBorder && isContinentBorder) {
            color = color.average(Color.BLACK).brighten(10)
        }
        return color.toHex()
    }

    getText(_point) {
        if (! this.showId)
            return ''
        const point = this.tileMap.rect.wrap(_point)
        const continent = this.tileMap.continent.get(point)
        if (this.tileMap.continent.isOrigin(point)) {
            return `${continent}`
        }
    }
}
