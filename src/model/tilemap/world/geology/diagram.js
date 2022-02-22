import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Direction } from '/src/lib/direction'
import { Color } from '/src/lib/color'

import { TileMapDiagram } from '/src/lib/model/tilemap'

const PL_LAND = '#574'
const PL_OCEAN = '#058'


class GeologyColorMap {
    constructor(tileMap) {
        const plateColors = tileMap.map(plateId => {
            const isOceanic = tileMap.isPlateOceanic(plateId)
            const hex = isOceanic ? PL_OCEAN: PL_LAND
            return [plateId, Color.fromHex(hex)]
        })
        const provinceColors = tileMap.getProvinces().map(id => {
            return [id, new Color()]
        })
        const surfaceColors = tileMap.getSurfaces().map(id => {
            const modifier = tileMap.isContinent(id)
                ? Color.GREEN
                : Color.BLUE
            return [id, new Color().average(modifier)]
        })
        this.tileMap = tileMap
        this.plateColorMap = new Map(plateColors)
        this.provinceColorMap = new Map(provinceColors)
        this.surfaceColorMap = new Map(surfaceColors)
    }

    getByPlate(plateId) {
        return this.plateColorMap.get(plateId)
    }

    getByProvince(provinceId) {
        return this.provinceColorMap.get(provinceId)
    }

    getBySurface(continentId) {
        return this.surfaceColorMap.get(continentId)
    }
}


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'GeologyTileMapDiagram',
        Type.boolean('showPlateBorder', 'Show plate borders', {default: false}),
        Type.boolean('showSurface', 'Show surface', {default: false}),
        Type.boolean('showProvince', 'Show province', {default: false}),
        Type.boolean('showProvinceBorder', 'Show province border', {default: false}),
        Type.boolean('showProvinceLevel', 'Show province level', {default: false}),
        Type.boolean('showFeatures', 'Show features', {default: true}),
        Type.boolean('showDirection', 'Show directions', {default: false}),
    )
    static colorMap = GeologyColorMap

    static create(tileMap, colorMap, params) {
        return new GeologyTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showSurface = params.get('showSurface')
        this.showPlateBorder = params.get('showPlateBorder')
        this.showDirection = params.get('showDirection')
        this.showProvince = params.get('showProvince')
        this.showProvinceLevel = params.get('showProvinceLevel')
        this.showProvinceBorder = params.get('showProvinceBorder')
        this.showFeatures = params.get('showFeatures')
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const plateId = this.tileMap.getPlate(point)
        const province = this.tileMap.getProvince(point)
        const surface = this.tileMap.getSurface(point)
        const provinceLevel = this.tileMap.getProvinceLevel(point)
        const isBorderPoint = this.tileMap.isPlateBorder(point)
        const isProvinceBorder = this.tileMap.isProvinceBorder(point)
        const feature = this.tileMap.getFeature(point)
        let color = this.colorMap.getByPlate(plateId)

        if (this.showProvince) {
            const provinceColor = this.colorMap.getByProvince(province.id)
            color = provinceColor.average(color).average(color)
        }
        if (this.showFeatures) {
            color = Color.fromHex(feature.color)
        }
        if (this.showSurface) {
            color = color.average(this.colorMap.getBySurface(surface))
        }
        if (this.showProvinceLevel) {
            color = color.darken(provinceLevel * 3)
        }
        if (this.showProvinceBorder && isProvinceBorder) {
            color = color.brighten(20)
        }
        if (this.showPlateBorder && isBorderPoint) {
            color = color.average(Color.BLACK).brighten(10)
        }
        return color
    }

    getText(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const plateId = this.tileMap.getPlate(point)
        const plateDirection = this.tileMap.getPlateDirection(point)
        if (this.showDirection && this.tileMap.isPlateOrigin(point)) {
            const dir = Direction.getSymbol(plateDirection)
            const dirName = Direction.getName(plateDirection)
            return `${plateId}:${dir}${dirName}`
        }
    }
}
