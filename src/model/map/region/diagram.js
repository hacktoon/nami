import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Color } from '/lib/base/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showBorders', 'Show borders', {default: true}),
        Type.boolean('showNeighborBorder', 'Show neighbor border', {default: false}),
        Type.boolean('showNeighborhood', 'Show neighborhood', {default: true}),
        Type.number('currentRegion', 'Current Region', {default: 0, min: 0, step: 1}),
    )

    static create(mapModel, params) {
        return new MapDiagram(mapModel, params)
    }

    constructor(mapModel, params) {
        super(mapModel)
        this.showBorders = params.get('showBorders')
        this.showNeighborBorder = params.get('showNeighborBorder')
        this.showNeighborhood = params.get('showNeighborhood')
        this.currentRegion = params.get('currentRegion')
        this.colorMap = this.buildColorMap()
    }

    buildColorMap() {
        const entries = this.mapModel.regions.map(region => [region.id, region.color])
        return Object.fromEntries(entries)
    }

    get(point) {
        const value = this.mapModel.getValue(point)
        const color = this.colorMap[value]
        const isCurrentRegion = this.currentRegion === value
        const isBorder = this.mapModel.isBorder(point)
        if (this.showNeighborhood) {
            if (isCurrentRegion) {
                return color.brighten(50).toHex()
            }
            if (this.mapModel.regions.isNeighborhood(value, this.currentRegion)) {
                return color.darken(50).toHex()
            }
        }
        if (isBorder) {
            if (this.showBorders && this.showNeighborBorder) {
                const border = this.mapModel.getBorder(point)
                return this.colorMap[border].toHex()
            }
            if (this.showBorders) {
                return color.darken(40).toHex()
            }
        }
        return color.toHex()
    }
}