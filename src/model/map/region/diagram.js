import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showBorders', 'Show borders', {default: true}),
        Type.boolean('showNeighborBorder', 'Show neighbor border', {default: true}),
        Type.boolean('showSelectedRegion', 'Show selected region', {default: false}),
        Type.number('selectedRegionId', 'Select region', {default: 0, min: 0, step: 1}),
    )

    static create(mapModel, params) {
        return new MapDiagram(mapModel, params)
    }

    constructor(mapModel, params) {
        super(mapModel)
        this.showBorders = params.get('showBorders')
        this.showNeighborBorder = params.get('showNeighborBorder')
        this.showSelectedRegion = params.get('showSelectedRegion')
        this.selectedRegionId = params.get('selectedRegionId')
        this.colorMap = new RegionColorMap(mapModel)
    }

    get(point) {
        const isBorder = this.mapModel.isBorder(point)
        const region = this.mapModel.getRegion(point)
        const color = this.colorMap.get(region)

        if (this.showBorders && isBorder) {
            if (this.showNeighborBorder) {
                const neighborRegions = this.mapModel.getBorderRegions(point)
                const borderColor = this.colorMap.getMix(neighborRegions)
                return borderColor.toHex()
            }
            return color.darken(50).toHex()
        }
        if (this.showSelectedRegion) {
            const toggle = (point.x + point.y) % 2 === 0
            if (this.selectedRegionId === region.id) {
                return toggle ? '#000' : '#FFF'
            } else if (this.mapModel.isNeighbor(this.selectedRegionId, region.id)) {
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
