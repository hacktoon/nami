import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMapDiagram } from '/model/lib/tilemap'


const SCHEMA = new Schema(
    'RegionTileMapDiagram',
    Type.boolean('showBorders', 'Show borders', {default: true}),
    Type.boolean('showOrigins', 'Show origins', {default: true}),
    Type.boolean('showNeighborBorder', 'Show neighbor border', {default: false}),
    Type.boolean('showSelectedRegion', 'Show selected region', {default: false}),
    Type.number('selectedRegionId', 'Select region', {default: 0, min: 0, step: 1}),
)


export class RegionTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA

    static create(tileMap, params) {
        return new RegionTileMapDiagram(tileMap, params)
    }

    constructor(tileMap, params) {
        super(tileMap)
        this.showBorders = params.get('showBorders')
        this.showOrigins = params.get('showOrigins')
        this.showNeighborBorder = params.get('showNeighborBorder')
        this.showSelectedRegion = params.get('showSelectedRegion')
        this.selectedRegionId = params.get('selectedRegionId')
        this.colorMap = new RegionColorMap(tileMap)
    }

    get(point) {
        const region = this.tileMap.getRegion(point)
        const isBorder = this.tileMap.isBorder(point)
        const color = this.colorMap.get(region)

        if (this.showOrigins && region.origin.equals(point)) {
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
            const toggle = (point.x + point.y) % 2 === 0
            if (this.selectedRegionId === region.id) {
                return toggle ? '#000' : '#FFF'
            } else if (this.tileMap.isNeighbor(this.selectedRegionId, region.id)) {
                return toggle ? color.darken(40).toHex() : color.toHex()
            }
        }
        return color.toHex()
    }
}


class RegionColorMap {
    constructor(regionMap) {
        const entries = regionMap.map(region => [region.id, region.color])
        this.map = new Map(entries)
    }

    get(region) {
        return this.map.get(region.id)
    }

    getMix([firstRegion, ...regions]) {
        let color = this.get(firstRegion)
        regions.forEach(region => {
            color = color.average(this.get(region))
        })
        return color
    }
}
