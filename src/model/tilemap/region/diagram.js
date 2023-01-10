import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'
import { TileMapDiagram } from '/src/model/lib/tilemap'


const SCHEMA = new Schema(
    'RegionTileMapDiagram',
    Type.boolean('showOrigins', 'Origins', {default: true}),
    Type.boolean('showLevels', 'Levels', {default: true}),
    Type.boolean('showBorders', 'Borders', {default: true}),
    Type.boolean('showNeighborBorder', 'Neighbor borders', {default: false}),
    Type.boolean('selectRegion', 'Select region', {default: false}),
    Type.number('selectedRegion', 'Region', {default: 0, min: 0, step: 1}),
    Type.number('selectedLevel', 'Level', {default: 1, min: 0}),
)


class RegionColorMap {
    #map

    constructor(regionMap) {
        const entries = regionMap.map(regionId => [regionId, new Color()])
        this.#map = new Map(entries)
    }

    get(regionId) {
        return this.#map.get(regionId) || Color.fromHex('#FFF')
    }

    getMix([firstRegionId, ...regionIds]) {
        let color = this.get(firstRegionId)
        for(let regionId of regionIds) {
            color = color.average(this.get(regionId))
        }
        return color
    }
}


export class RegionTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA
    static colorMap = RegionColorMap

    static create(tileMap, colorMap, params) {
        return new RegionTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.params = params
        this.colorMap = colorMap
        this.showBorders = params.get('showBorders')
        this.showOrigins = params.get('showOrigins')
        this.showLevels = params.get('showLevels')
        this.showNeighborBorder = params.get('showNeighborBorder')
        this.selectedLevel = params.get('selectedLevel')
        this.level = params.get('level')
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const regionId = this.tileMap.getRegion(point)
        const level = this.tileMap.getLevel(point)
        const color = this.colorMap.get(regionId)
        if (level >= this.selectedLevel) {
            return Color.WHITE
        }
        if (this.showOrigins && this.tileMap.isOrigin(point)) {
            return color.invert()
        }
        if (this.showBorders && this.tileMap.isBorder(point)) {
            if (this.showNeighborBorder) {
                const neighborRegions = this.tileMap.getBorderRegions(point)
                const borderColor = this.colorMap.getMix(neighborRegions)
                return borderColor
            }
            return color.darken(50)
        }
        if (this.showLevels) {
            const level = this.tileMap.getLevel(point)
            return color.darken(level * 1.5)
        }
        if (this.params.get('selectRegion')) {
            const toggle = (point[0] + point[1]) % 2 === 0
            const selectedRegion = this.params.get('selectedRegion')
            if (selectedRegion === regionId) {
                return Color.WHITE
            } else if (this.tileMap.isNeighbor(selectedRegion, regionId)) {
                return toggle ? color.darken(40) : color
            }
        }
        return color
    }
}
