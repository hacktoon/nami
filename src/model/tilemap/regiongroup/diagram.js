import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMapDiagram } from '/lib/model/tilemap'


const SCHEMA = new Schema(
    'RegionGroupTileMapDiagram',
    Type.boolean('showGroups', 'Show groups', {default: true}),
    Type.boolean('showOrigins', 'Show origins', {default: true}),
    Type.boolean('showGroupBorder', 'Show group border', {default: true}),
    Type.boolean('showRegions', 'Show regions', {default: false}),
    Type.boolean('showBorderRegion', 'Show border region', {default: false}),
    Type.boolean('showRegionBorder', 'Show region border', {default: false}),
)


export class RegionGroupTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA

    static create(tileMap, params) {
        return new RegionGroupTileMapDiagram(tileMap, params)
    }

    constructor(tileMap, params) {
        super(tileMap)
        this.showGroups = params.get('showGroups')
        this.showOrigins = params.get('showOrigins')
        this.showRegions = params.get('showRegions')
        this.showRegionBorder = params.get('showRegionBorder')
        this.showGroupBorder = params.get('showGroupBorder')
        this.showBorderRegion = params.get('showBorderRegion')
        this.regionColorMap = new RegionColorMap(tileMap.getRegions())
        this.groupColorMap = new GroupColorMap(tileMap.getGroups())
    }

    get(point) {
        const group = this.tileMap.getGroup(point)
        const region = this.tileMap.getRegion(point)
        const groupColor = this.groupColorMap.get(group)
        const regionColor = this.regionColorMap.get(region)
        const isBorderRegion = this.tileMap.isBorderRegion(region)

        if (this.showOrigins && group.origin.equals(point)) {
            return groupColor.invert().toHex()
        }
        if (this.showGroupBorder && this.tileMap.isGroupBorder(point)) {
            return groupColor.darken(50).toHex()
        }
        if (this.showRegionBorder && this.tileMap.isRegionBorder(point)) {
            let color = regionColor.darken(50)
            if (this.showGroups)
                color = groupColor.brighten(50)
            return color.toHex()
        }
        if (this.showGroups) {
            let color = groupColor
            if (this.showRegions)
                color = regionColor.average(groupColor).average(groupColor)
            if (isBorderRegion && this.showBorderRegion)
                return color.darken(90).toHex()
            return color.toHex()
        }
        if (this.showRegions) {
            let color = isBorderRegion ? regionColor.brighten(50) : regionColor
            return color.toHex()
        }
        return regionColor.grayscale().toHex()
    }

    getText(point) {
        const group = this.tileMap.getGroup(point)
        if (group.origin.equals(point)) {
            return String(group.id)
        }
        return ''
    }
}


class RegionColorMap {
    constructor(regions) {
        const entries = regions.map(region => [region.id, region.color])
        this.map = Object.fromEntries(entries)
    }

    get(region) {
        return this.map[region.id]
    }
}


class GroupColorMap {
    constructor(groups) {
        const entries = groups.map(group => [group.id, group.color])
        this.map = Object.fromEntries(entries)
    }

    get(group) {
        return this.map[group.id]
    }
}
