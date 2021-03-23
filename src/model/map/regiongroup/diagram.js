import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showGroup', 'Show group', {default: true}),
        Type.boolean('showBorder', 'Show border', {default: false}),
    )

    static create(mapModel, params) {
        return new MapDiagram(mapModel, params)
    }

    constructor(mapModel, params) {
        super(mapModel)
        this.showBorder = params.get('showBorder')
        this.showGroup = params.get('showGroup')
        this.regionColorMap = new RegionColorMap(mapModel.regionMap)
        this.groupColorMap = new GroupColorMap(mapModel)
    }

    get(point) {
        const region = this.mapModel.getRegion(point)
        const group = this.mapModel.getGroup(point)
        const regionColor = this.regionColorMap.get(region)
        const groupColor = this.groupColorMap.get(group)

        if (this.showGroup) {
            const color = regionColor.average(groupColor).average(groupColor)
            if (this.showBorder && this.mapModel.isRegionBorder(point))
                return color.darken(80).toHex()
            return color.toHex()
        }
        if (this.showBorder && this.mapModel.isRegionBorder(point))
            return regionColor.darken(60).toHex()
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
