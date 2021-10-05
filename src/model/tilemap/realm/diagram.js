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
        const regionEntries = regionMap.map(region => [region.id, new Color()])
        const realmEntries = realmTileMap.map(realm => [realm.id, new Color()])
        this.#regionMap = new Map(regionEntries)
        this.#realmMap = new Map(realmEntries)
    }

    getByRegion(region) {
        return this.#regionMap.get(region.id) || Color.fromHex('#FFF')
    }

    getByRealm(realm) {
        return this.#realmMap.get(realm.id) || Color.fromHex('#FFF')
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
        const realm = this.tileMap.getRealm(point)
        const region = this.tileMap.getRegion(point)
        const isBorderRegion = this.tileMap.isBorderRegion(region)
        const realmColor = this.colorMap.getByRealm(realm)
        const regionColor = this.colorMap.getByRegion(region)

        if (this.showOrigins && Point.equals(realm.origin, point)) {
            return realmColor.invert().toHex()
        }
        if (this.showRealmBorder && this.tileMap.isRealmBorder(point)) {
            return realmColor.darken(50).toHex()
        }
        if (this.showRegionBorder && this.tileMap.isRegionBorder(point)) {
            let color = regionColor.darken(50)
            if (this.showRealms)
                color = realmColor.brighten(50)
            return color.toHex()
        }
        if (this.showRealms) {
            let color = realmColor
            if (this.showRegions)
                color = regionColor.average(realmColor).average(realmColor)
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
    //     const realm = this.tileMap.getRealm(point)
    //     if (Point.equals(realm.origin, point)) {
    //         return String(realm.id)
    //     }
    //     return ''
    // }
}
