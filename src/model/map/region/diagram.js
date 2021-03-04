import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Color } from '/lib/base/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showBorders', 'Show borders', {default: false}),
        Type.boolean('showNeighborBorder', 'Show neighbor border', {default: false}),
        Type.boolean('showSelectedRegion', 'Show selected region', {default: true}),
        Type.number('selectRegion', 'Select region', {default: 0, min: 0, step: 1}),
    )

    static create(mapModel, params) {
        return new MapDiagram(mapModel, params)
    }

    constructor(mapModel, params) {
        super(mapModel)
        this.showBorders = params.get('showBorders')
        this.showNeighborBorder = params.get('showNeighborBorder')
        this.showSelectedRegion = params.get('showSelectedRegion')
        this.selectRegion = params.get('selectRegion')
        this.colorMap = new RegionColorMap(mapModel.regions)
    }

    get(point) {
        const region = this.mapModel.getRegion(point)
        const color = this.colorMap.get(region)
        const isBorder = this.mapModel.isBorder(point)

        if (this.showSelectedRegion) {
            if (this.selectRegion === region.id) {
                if (isBorder) return color.invert().toHex()
                const toggle = (point.x + point.y) % 2 === 0
                return toggle ? '#000' : color.toHex()
            }
        }
        if (isBorder) {
            if (this.showBorders && this.showNeighborBorder) {
                const neighborRegion = this.mapModel.getBorderRegion(point)
                return this.colorMap.get(neighborRegion).toHex()
            }
            if (this.showBorders) {
                return color.darken(50).toHex()
            }
        }
        return color.toHex()
    }
}


class RegionColorMap {
    constructor(regions) {
        const entries = regions.map(region => [region.id, region.color])
        this.map = Object.fromEntries(entries)
    }

    get(region) {
        return this.map[region.id]
    }
}