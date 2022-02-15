import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Color } from '/lib/color'
import { Random } from '/lib/random'

import { TileMapDiagram } from '/lib/model/tilemap'

const LAND_COLOR = Color.fromHex('#574')
const OCEAN_COLOR = Color.fromHex('#047')


class GeologyColorMap {
    #continentColorMap
    #groupColorMap
    #provinceColorMap

    constructor(tileMap) {
        const continentColors = tileMap.map(continent => {
            const isOceanic = tileMap.continent.isOceanic(continent)
            const color = isOceanic
                ? OCEAN_COLOR
                : LAND_COLOR.darken(Random.choice(0, 20, 40, 60))
            return [continent, color]
        })
        const groupColors = tileMap.continent.groups.map(group => {
            return [group, new Color()]
        })
        const provinceColors = tileMap.province.map(province => {
            const color = tileMap.province.getType(province).color
            return [province, Color.fromHex(color)]
        })
        this.tileMap = tileMap
        this.#continentColorMap = new Map(continentColors)
        this.#groupColorMap = new Map(groupColors)
        this.#provinceColorMap = new Map(provinceColors)
    }

    getByContinent(continent) {
        return this.#continentColorMap.get(continent)
    }

    getByGroup(group) {
        return this.#groupColorMap.get(group)
    }

    getByProvince(province) {
        return this.#provinceColorMap.get(province)
    }
}


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'GeologyTileMapDiagram',
        Type.boolean('showId', 'Continent id', {default: true}),
        Type.boolean('showContinentGroup', 'Continent groups', {default: true}),
        Type.boolean('showContinentBorder', 'Continent border', {default: true}),
        Type.boolean('showProvinces', 'Provinces', {default: true}),
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
        this.showContinentGroup = params.get('showContinentGroup')
        this.showProvinceBorder = params.get('showProvinceBorder')
        this.showProvinces = params.get('showProvinces')
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const continent = this.tileMap.continent.get(point)
        const province = this.tileMap.province.get(point)
        const group = this.tileMap.continent.getGroup(continent)
        const isContinentBorder = this.tileMap.continent.isBorder(point)
        const isProvinceBorder = this.tileMap.province.isBorder(point)
        let color = this.colorMap.getByContinent(continent)
        let provinceColor = this.colorMap.getByProvince(province)

        if (this.showContinentGroup) {
            return this.colorMap.getByGroup(group).toHex()
        }
        if (this.showProvinces) {
            if (this.tileMap.province.isCorner(province)) {
                const isOceanic = this.tileMap.continent.isOceanic(continent)
                color = isOceanic ? provinceColor.brighten(20) : OCEAN_COLOR.brighten(20)
            } else if (this.tileMap.province.isBorderProvince(province)) {
                const isOceanic = this.tileMap.continent.isOceanic(continent)
                color = isOceanic ? provinceColor.brighten(20) : provinceColor.darken(10)
            }
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
