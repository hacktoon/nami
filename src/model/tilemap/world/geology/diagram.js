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

    getByOutline(point) {
        const isWater = this.tileMap.surface.isWater(point)
        return isWater ? '#047' : '#574'
    }

    getByPlate(plate) {
        const isOceanic = this.tileMap.continent.isOceanic(plate)
        return Color.fromHex(isOceanic ? '#047' : '#574')
    }
}


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'Geology3TileMapDiagram',
        Type.boolean('showPlateBorder', 'Plate border', {default: false}),
        Type.boolean('showContinent', 'Continent', {default: false}),
        Type.boolean('showLevel', 'Levels', {default: false}),
        Type.boolean('showOutline', 'Outline', {default: true}),
        Type.boolean('showShore', 'Shore', {default: true}),
    )
    static colorMap = GeologyColorMap

    static create(tileMap, colorMap, params) {
        return new GeologyTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showPlateBorder = params.get('showPlateBorder')
        this.showContinent = params.get('showContinent')
        this.showNoise = params.get('showNoise')
        this.showLevel = params.get('showLevel')
        this.showOutline = params.get('showOutline')
        this.showShore = params.get('showShore')
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const plate = this.tileMap.continent.getPlate(point)
        const continent = this.tileMap.continent.get(plate)
        const level = this.tileMap.surface.getLevel(point)
        let color = this.colorMap.getByPlate(plate)

        if (this.showOutline) {
            color = Color.fromHex(this.colorMap.getByOutline(point))
        }
        if (this.showShore && this.tileMap.relief.isShore(point)) {
            color = color.darken(20)
        }
        if (this.showContinent) {
            color = this.colorMap.getByContinent(continent).average(color)
        }
        if (this.showLevel) {
            color = color.darken(2 * level)
        }
        if (this.showPlateBorder && this.tileMap.continent.isBorder(point)) {
            color = color.average(Color.BLACK)
        }
        return color
    }
}
