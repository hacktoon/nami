import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'
import { TileMapDiagram } from '/src/model/tilemap/lib'


const SCHEMA = new Schema(
    'RegionTileMapDiagram',
    Type.boolean('showOrigins', 'Origins', {default: true}),
    Type.boolean('showBorders', 'Borders', {default: true}),
    Type.boolean('selectRegion', 'Select region', {default: false}),
    Type.number('selectedRegion', 'Region', {default: 0, min: 0, step: 1}),
    Type.boolean('showGrowth', 'Growth', {default: true}),
    Type.number('selectedGrowth', 'Growth', {default: 1, min: 0}),
    Type.boolean('showLevels', 'Levels', {default: true}),
    Type.number('selectedLevel', 'Level', {default: 1, min: 0}),
)


export class RegionTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA
    static create(tileMap, params) {
        return new RegionTileMapDiagram(tileMap, params)
    }

    constructor(tileMap, params) {
        super(tileMap)
        this.params = params
        this.showBorders = params.get('showBorders')
        this.showOrigins = params.get('showOrigins')
        this.selectedGrowth = params.get('selectedGrowth')
        this.selectedLevel = params.get('selectedLevel')
        this.showLevels = params.get('showLevels')
        this.showGrowth = params.get('showGrowth')
    }

    drawBackground(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const regionId = this.tileMap.getRegion(point)
        const growth = this.tileMap.getGrowth(point)
        const color = this.tileMap.getColor(point, this.showBorders)

        if (this.showOrigins && this.tileMap.isOrigin(point)) {
            return color.invert()
        }

        if (this.showLevels) {
            const level = this.tileMap.getLevel(point)
            if (level > this.selectedLevel) {
                return Color.WHITE
            }
            return color.darken(level * 1.5)
        }
        if (this.showGrowth) {
            if (growth >= this.selectedGrowth) {
                return Color.WHITE
            }
            return color.darken(growth * 1.5)
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
