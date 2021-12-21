import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Point } from '/lib/point'
import { Color } from '/lib/color'
import { TileMapDiagram } from '/lib/model/tilemap'


const SCHEMA = new Schema(
    'RealmTileMapDiagram',
    Type.boolean('showRealms', 'Show realms', {default: true}),
    Type.boolean('showOrigins', 'Show origins', {default: true}),
    Type.boolean('showRealmBorder', 'Show realm border', {default: true}),
    Type.boolean('showRegions', 'Show regions', {default: false}),
    Type.boolean('showBorderRegion', 'Show border region', {default: false}),
    Type.boolean('showRegionBorder', 'Show region border', {default: false}),
)


class RealmColorMap {
    #regionMap
    #realmMap

    constructor(realmTileMap) {
        const regionMap = realmTileMap.regionTileMap
        const regionEntries = regionMap.map(regionId => [regionId, new Color()])
        const realmEntries = realmTileMap.map(realmId => [realmId, new Color()])
        this.#regionMap = new Map(regionEntries)
        this.#realmMap = new Map(realmEntries)
    }

    getByRegion(regionId) {
        return this.#regionMap.get(regionId) || Color.fromHex('#FFF')
    }

    getByRealm(realmId) {
        return this.#realmMap.get(realmId) || Color.fromHex('#FFF')
    }
}


export class RealmTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA
    static colorMap = RealmColorMap

    static create(tileMap, colorMap, params) {
        return new RealmTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showRealms = params.get('showRealms')
        this.showOrigins = params.get('showOrigins')
        this.showRegions = params.get('showRegions')
        this.showRegionBorder = params.get('showRegionBorder')
        this.showRealmBorder = params.get('showRealmBorder')
        this.showBorderRegion = params.get('showBorderRegion')
    }

    get(point) {
        const realmId = this.tileMap.getRealm(point)
        const realmOrigin = this.tileMap.getRealmOrigin(point)
        const regionId = this.tileMap.getRegion(point)
        const realmColor = this.colorMap.getByRealm(realmId)
        const regionColor = this.colorMap.getByRegion(regionId)
        const isBorderRegion = this.tileMap.isBorderRegion(regionId)
        let color = realmColor

        const origin = this.tileMap.regionTileMap.regionMatrix.wrap(point)
        if (this.showOrigins && Point.equals(realmOrigin, origin)) {
            if (this.showRealms)
                return realmColor.invert().toHex()
            return '#000'
        }
        if (this.showRealmBorder && this.tileMap.isRealmBorder(point)) {
            return realmColor.darken(50).toHex()
        }
        if (this.showRegionBorder && this.tileMap.isRegionBorder(point)) {
            color = regionColor.darken(50)
            if (this.showRealms)
                color = realmColor.brighten(50)
            return color.toHex()
        }
        if (this.showRealms) {
            if (this.showRegions)
                color = regionColor.average(realmColor).average(realmColor)
            if (this.showBorderRegion && isBorderRegion)
                return color.darken(90).toHex()
            return color.toHex()
        }
        if (this.showRegions) {
            color = isBorderRegion ? regionColor.brighten(50) : regionColor
            return color.toHex()
        }
        return '#FFF'
    }

    // getText(point) {
    //     const realm = this.tileMap.getRealm(point)
    //     if (Point.equals(realm.origin, point)) {
    //         return String(realm.id)
    //     }
    //     return ''
    // }
}
