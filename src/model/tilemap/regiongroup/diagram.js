import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMapDiagram } from '/model/lib/tilemap'


const SCHEMA = new Schema(
    'RegionGroupTileMapDiagram',
    Type.boolean('showGroups', 'Show groups', {default: true}),
    Type.boolean('showGroupBorder', 'Show group border', {default: false}),
    Type.boolean('showRegions', 'Show regions', {default: true}),
    Type.boolean('showRegionBorder', 'Show region border', {default: false}),
)


export class RegionGroupTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA

    static create(mapModel, params) {
        return new RegionGroupTileMapDiagram(mapModel, params)
    }

    constructor(mapModel, params) {
        super(mapModel)
        this.showRegions = params.get('showRegions')
        this.showGroups = params.get('showGroups')
        this.showRegionBorder = params.get('showRegionBorder')
        this.showGroupBorder = params.get('showGroupBorder')
        this.regionColorMap = new RegionColorMap(mapModel.table.regionTileMap)
        this.groupColorMap = new GroupColorMap(mapModel)
    }

    get(point) {
        const region = this.mapModel.getRegion(point)
        const group = this.mapModel.getGroup(point)
        const regionColor = this.regionColorMap.get(region)
        const groupColor = this.groupColorMap.get(group)
        const isBorderRegion = this.mapModel.isBorderRegion(region)

        if (this.showGroupBorder && this.mapModel.isGroupBorderPoint(point)) {
            return groupColor.brighten(50).toHex()
        }
        if (this.showRegionBorder && this.mapModel.isRegionBorder(point)) {
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
            let color = isBorderRegion ? regionColor.darken(60) : regionColor
            return color.toHex()
        }
        return regionColor.grayscale().toHex()
    }
}


class RegionColorMap {
    constructor(regionTileMap) {
        const entries = regionTileMap.map(region => [region.id, region.color])
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
