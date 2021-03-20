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
        this.colorMap = new RegionColorMap(mapModel.regionMap)
        this.groupColorMap = new GroupColorMap(mapModel.groupMap)
    }

    get(point) {
        const region = this.mapModel.getRegion(point)
        const regionColor = this.colorMap.get(region)
        const [groupId, level] = this.mapModel.groupMap.get(region.id)
        const groupColor = this.groupColorMap.get(groupId)

        if (this.showGroup) {
            if (this.showBorder && this.mapModel.isRegionBorder(point))
                return groupColor.darken(50).toHex()
            else
                return groupColor.darken(level * 20).toHex()
        }
        if (this.showBorder && this.mapModel.isRegionBorder(point)) {
            return regionColor.darken(50).toHex()
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
        this.map = {}
        groupMap.forEach(entry => {
            const [groupId, level] = entry
            this.map[groupId] = (new Color()).brighten(level * 10)
        })
    }

    get(groupId) {
        return this.map[groupId]
    }
}
