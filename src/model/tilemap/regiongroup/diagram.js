import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Point } from '/lib/base/point'
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
    }

    get(point) {
        const group = this.tileMap.getGroup(point)
        const region = this.tileMap.getRegion(point)
        const isBorderRegion = this.tileMap.isBorderRegion(region)

        if (this.showOrigins && Point.equals(group.origin, point)) {
            return group.color.invert().toHex()
        }
        if (this.showGroupBorder && this.tileMap.isGroupBorder(point)) {
            return group.color.darken(50).toHex()
        }
        if (this.showRegionBorder && this.tileMap.isRegionBorder(point)) {
            let color = region.color.darken(50)
            if (this.showGroups)
                color = group.color.brighten(50)
            return color.toHex()
        }
        if (this.showGroups) {
            let color = group.color
            if (this.showRegions)
                color = region.color.average(group.color).average(group.color)
            if (isBorderRegion && this.showBorderRegion)
                return color.darken(90).toHex()
            return color.toHex()
        }
        if (this.showRegions) {
            let color = isBorderRegion ? region.color.brighten(50) : region.color
            return color.toHex()
        }
        return region.color.grayscale().toHex()
    }

    // getText(point) {
    //     const group = this.tileMap.getGroup(point)
    //     if (Point.equals(group.origin, point)) {
    //         return String(group.id)
    //     }
    //     return ''
    // }
}
