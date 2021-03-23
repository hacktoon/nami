import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showGroups', 'Show groups', {default: true}),
        Type.boolean('showGroupBorder', 'Show group border', {default: true}),
        Type.boolean('showRegions', 'Show regions', {default: true}),
        Type.boolean('showRegionBorder', 'Show region border', {default: true}),
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
        this.regionColorMap = new RegionColorMap(mapModel.regionMap)
        this.groupColorMap = new GroupColorMap(mapModel)
    }

    get(point) {
        const region = this.mapModel.getRegion(point)
        const group = this.mapModel.getGroup(point)
        const regionColor = this.regionColorMap.get(region)
        const groupColor = this.groupColorMap.get(group)
        const isRegionBorder = this.mapModel.isRegionBorder(point)
        const isGroupBorder = this.mapModel.isGroupBorder(point)

        if (this.showGroupBorder && isGroupBorder) {
            return groupColor.darken(60).toHex()
        }
        if (this.showRegionBorder && isRegionBorder) {
            if (this.showGroups)
                return groupColor.brighten(60).toHex()
            return regionColor.darken(60).toHex()
        }
        if (this.showGroups) {
            if (this.showRegions) {
                return regionColor.average(groupColor).average(groupColor).toHex()
            }
            return groupColor.toHex()
        }
        return regionColor.toHex()
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
