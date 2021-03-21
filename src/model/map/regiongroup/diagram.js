import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Color } from '/lib/base/color'
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
        this.groupColorMap = new GroupColorMap(mapModel.groupMap)
    }

    get(point) {
        const region = this.mapModel.getRegion(point)
        const group = this.mapModel.groupMap.get(region)
        const regionColor = this.regionColorMap.get(region)
        const groupColor = this.groupColorMap.get(group)
        let color = regionColor

        if (this.showGroup) {
            color = groupColor.average(regionColor)
        }
        if (this.showBorder && this.mapModel.isRegionBorder(point)) {
            color = groupColor
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


class GroupColorMap {
    constructor(groupMap) {
        this.map = {}
        groupMap.forEach(group => {
            this.map[group.id] = new Color()
        })
    }

    get(group) {
        return this.map[group.id]
    }
}
