import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Point } from '/lib/point'
import { Color } from '/lib/color'
import { TileMapDiagram } from '/lib/model/tilemap'


const SCHEMA = new Schema(
    'RegionTileMapDiagram',
    Type.boolean('showBorders', 'Show borders', {default: true}),
    Type.boolean('showOrigins', 'Show origins', {default: true}),
    Type.boolean('showNeighborBorder', 'Show neighbor border', {default: false}),
    Type.boolean('showSelectedRegion', 'Show selected region', {default: false}),
    Type.number('selectedRegionId', 'Select region', {default: 0, min: 0, step: 1}),
    Type.number('level', 'Level', {default: 0, min: 0, step: 1}),
)


class RegionColorMap {
    constructor(regionMap) {
        const entries = regionMap.map(region => [region.id, new Color()])
        this.map = new Map(entries)
    }

    get(region) {
        return this.map.get(region.id) || Color.fromHex('#FFF')
    }

    getMix([firstRegion, ...regions]) {
        let color = this.get(firstRegion)
        regions.forEach(region => {
            color = color.average(this.get(region))
        })
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
        this.colorMap = colorMap
        this.showBorders = params.get('showBorders')
        this.showOrigins = params.get('showOrigins')
        this.showNeighborBorder = params.get('showNeighborBorder')
        this.showSelectedRegion = params.get('showSelectedRegion')
        this.selectedRegionId = params.get('selectedRegionId')
        this.level = params.get('level')
    }

    get(point) {
        const region = this.tileMap.getRegion(point)
        const isBorder = this.tileMap.isBorder(point)
        const level = this.tileMap.getLevel(point)
        const color = this.colorMap.get(region)

        if (this.showOrigins && Point.equals(region.origin, point)) {
            return color.invert().toHex()
        }
        if (this.showBorders && isBorder) {
            if (this.showNeighborBorder) {
                const neighborRegions = this.tileMap.getBorderRegions(point)
                const borderColor = this.colorMap.getMix(neighborRegions)
                return borderColor.toHex()
            }
            return color.darken(50).toHex()
        }
        if (this.showSelectedRegion) {
            const toggle = (point[0] + point[1]) % 2 === 0
            if (this.selectedRegionId === region.id) {
                return toggle ? '#000' : '#FFF'
            } else if (this.tileMap.isNeighbor(this.selectedRegionId, region.id)) {
                return toggle ? color.darken(40).toHex() : color.toHex()
            }
        }
        if (level <= this.level) {
            return color.toHex()
        }
        return '#fff'
    }

    // getText(point) {
    //     const region = this.tileMap.getRegion(point)
    //     if (Point.equals(region.origin, point)) {
    //         return String(region.id)
    //     }
    //     return ''
    // }
}
