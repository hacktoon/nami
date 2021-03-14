import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showBorder', 'Show border', {default: true}),
        Type.boolean('showSubBorder', 'Show sub border', {default: false}),
    )

    static create(mapModel, params) {
        return new MapDiagram(mapModel, params)
    }

    constructor(mapModel, params) {
        super(mapModel)
        this.showBorder = params.get('showBorder')
        this.showSubBorder = params.get('showSubBorder')
        this.colorMap = new RegionColorMap(mapModel.regionMap)
        this.subcolorMap = new RegionColorMap(mapModel.subRegionMap)
    }

    get(point) {
        const region = this.mapModel.getRegion(point)
        const subregion = this.mapModel.getSubRegion(point)
        const color = this.colorMap.get(region)
        const subcolor = this.subcolorMap.get(subregion)

        if (this.showBorder && this.mapModel.isRegionBorder(point)) {
            return color.darken(50).toHex()
        }
        if (this.showSubBorder && this.mapModel.isSubRegionBorder(point)) {
            return subcolor.toHex()
        }
        return color.average(subcolor).toHex()
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
