import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showGroups', 'Show groups', {default: true}),
        Type.boolean('showGroupBorder', 'Show group border', {default: false}),
        Type.boolean('showRegions', 'Show regions', {default: true}),
        Type.boolean('showRegionBorder', 'Show region border', {default: false}),
    )

    static create(mapModel, params) {
        return new MapDiagram(mapModel, params)
    }

    constructor(mapModel, params) {
        super(mapModel)
        this.showRegions = params.get('showRegions')
        this.showGroups = params.get('showGroups')
        this.showRegionBorder = params.get('showRegionBorder')
        this.showGroupBorder = params.get('showGroupBorder')
        this.regionColorMap = new RegionColorMap(mapModel.table.regionMap)
        this.groupColorMap = new GroupColorMap(mapModel)
    }

    get(point) {
        const region = this.mapModel.getRegion(point)
        const group = this.mapModel.getGroup(point)
        const regionColor = this.regionColorMap.get(region)
        const groupColor = this.groupColorMap.get(group)
        const isRegionBorderPoint = this.mapModel.isRegionBorderPoint(point)
        const isGroupBorderPoint = this.mapModel.isGroupBorderPoint(point)
        const isBorderRegion = this.mapModel.table.borderRegions.has(region.id)

        if (this.showGroupBorder && isGroupBorderPoint) {
            return groupColor.darken(60).toHex()
        }
        if (this.showRegionBorder && isRegionBorderPoint) {
            let color = this.showGroups ? groupColor.brighten(60) : regionColor.darken(60)
            return color.toHex()
        }
        if (this.showGroups) {
            if (this.showRegions) {
                let color = regionColor.average(groupColor).average(groupColor)
                color = isBorderRegion ? color.darken(80) : color
                return color.toHex()
            }
            return groupColor.toHex()
        }
        if (this.showRegions) {
            let color = isBorderRegion ? regionColor.darken(80) : regionColor
            return color.toHex()
        }
        return regionColor.grayscale().toHex()
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


class GroupColorMap {
    constructor(groupMap) {
        const entries = groupMap.map(group => [group.id, group.color])
        this.map = Object.fromEntries(entries)
    }

    get(group) {
        return this.map[group.id]
    }
}
