import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Point } from '/lib/base/point'
import { Color } from '/lib/base/color'
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


class RegionGroupColorMap {
    #regionMap
    #groupMap

    constructor(regionGroupMap) {
        const regionMap = regionGroupMap.regionTileMap
        const groups = regionGroupMap.getGroups()
        const regionEntries = regionMap.map(region => [region.id, new Color()])
        const groupEntries = groups.map(group => [group.id, new Color()])
        this.#regionMap = new Map(regionEntries)
        this.#groupMap = new Map(groupEntries)
    }

    getByRegion(region) {
        return this.#regionMap.get(region.id) || Color.fromHex('#FFF')
    }

    getByGroup(group) {
        return this.#groupMap.get(group.id) || Color.fromHex('#FFF')
    }
}


export class RegionGroupTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA
    static colorMap = RegionGroupColorMap

    static create(tileMap, colorMap, params) {
        return new RegionGroupTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showGroups = params.get('showGroups')
        this.showOrigins = params.get('showOrigins')
        this.showRegions = params.get('showRegions')
        this.showRegionBorder = params.get('showRegionBorder')
        this.showGroupBorder = params.get('showGroupBorder')
        this.showBorderRegion = params.get('showBorderRegion')
    }

    get(point) {
        const group = this.tileMap.getGroup(point)
        const region = this.tileMap.getRegion(point)
        const isBorderRegion = this.tileMap.isBorderRegion(region)
        const groupColor = this.colorMap.getByGroup(group)
        const regionColor = this.colorMap.getByRegion(region)

        if (this.showOrigins && Point.equals(group.origin, point)) {
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

    // getText(point) {
    //     const group = this.tileMap.getGroup(point)
    //     if (Point.equals(group.origin, point)) {
    //         return String(group.id)
    //     }
    //     return ''
    // }
}
