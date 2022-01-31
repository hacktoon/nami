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
    Type.boolean('showLevel', 'Show level', {default: false}),
    Type.number('selectedRegionId', 'Select region', {default: 0, min: 0, step: 1}),
    Type.number('level', 'Level', {default: 0, min: 0, step: 1}),
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
        this.colorMap = colorMap
        this.showBorders = params.get('showBorders')
        this.showOrigins = params.get('showOrigins')
        this.showLevel = params.get('showLevel')
        this.showNeighborBorder = params.get('showNeighborBorder')
        this.showSelectedRegion = params.get('showSelectedRegion')
        this.selectedRegionId = params.get('selectedRegionId')
        this.level = params.get('level')
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const regionId = this.tileMap.getRegion(point)
        const regionOrigin = this.tileMap.getRegionOrigin(point)
        const level = this.tileMap.getLevel(point)
        const color = this.colorMap.get(regionId)

        if (this.showOrigins && Point.equals(regionOrigin, point)) {
            return color.invert().toHex()
        }
        if (this.showBorders && this.tileMap.isBorder(point)) {
            if (this.showNeighborBorder) {
                const neighborRegions = this.tileMap.getBorderRegions(point)
                const borderColor = this.colorMap.getMix(neighborRegions)
                return borderColor.toHex()
            }
            return color.darken(50).toHex()
        }
        if (this.showSelectedRegion) {
            const toggle = (point[0] + point[1]) % 2 === 0
            if (this.selectedRegionId === regionId) {
                return toggle ? '#000' : '#FFF'
            } else if (this.tileMap.isNeighbor(this.selectedRegionId, regionId)) {
                return toggle ? color.darken(40).toHex() : color.toHex()
            }
        }
        if (this.showLevel && level > this.level) {
            return '#fff'
        }
        return color.toHex()
    }
}
