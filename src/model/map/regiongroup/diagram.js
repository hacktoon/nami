import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showBorder', 'Show border', {default: false}),
    )

    static create(mapModel, params) {
        return new MapDiagram(mapModel, params)
    }

    constructor(mapModel, params) {
        super(mapModel)
        this.showBorder = params.get('showBorder')
        this.colorMap = new RegionColorMap(mapModel.regionMap)
    }

    get(point) {
        const region = this.mapModel.getRegion(point)
        const color = this.colorMap.get(region)
        if (this.showBorder && this.mapModel.isRegionBorder(point)) {
            return color.darken(50).toHex()
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
