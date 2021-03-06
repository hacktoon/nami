import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Color } from '/lib/base/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showBorders', 'Show borders', {default: false}),
        Type.boolean('showNeighborBorder', 'Show neighbor border', {default: false}),
        Type.boolean('showSelectedRegion', 'Show selected region', {default: true}),
        Type.number('selectedRegion', 'Select region', {default: 0, min: 0, step: 1}),
    )

    static create(mapModel, params) {
        return new MapDiagram(mapModel, params)
    }

    constructor(mapModel, params) {
        super(mapModel)
        this.showBorders = params.get('showBorders')
        this.showNeighborBorder = params.get('showNeighborBorder')
        this.showSelectedRegion = params.get('showSelectedRegion')
        this.selectedRegion = params.get('selectedRegion')
        this.colorMap = new RegionColorMap(mapModel)
    }

    get(point) {
        const isBorder = this.mapModel.isBorder(point)
        const region = this.mapModel.getRegion(point)
        const color = this.colorMap.get(region)

        const neighborRegion = this.mapModel.getBorderRegion(point)
        // const edges = new Set(this.mapModel.getRegionEdges(neighborRegion))

        if (this.showSelectedRegion) {
            if (this.selectedRegion === region.id) {
                if (isBorder) return color.invert().toHex()
                const toggle = (point.x + point.y) % 2 === 0
                return toggle ? '#000' : color.toHex()
            }
        }
        if (isBorder) {
            if (this.showBorders && this.showNeighborBorder) {
                const borderColor = this.colorMap.get(neighborRegion)
                return borderColor.darken(50).toHex()
            }
            if (this.showBorders) {
                return color.darken(50).toHex()
            }
        }
        return color.toHex()
    }
}


class RegionColorMap {
    constructor(regionMap) {
        const entries = regionMap.map(region => [region.id, region.color])
        this.map = Object.fromEntries(entries)
    }

    get(region) {
        return this.map[region.id]
    }
}
