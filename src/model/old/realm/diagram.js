import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { TileMapDiagram } from '/src/model/lib/tilemap'


const SCHEMA = new Schema(
    'RealmTileMapDiagram',
    Type.boolean('showCenters', 'Realm centers', {default: true}),
    Type.boolean('showRealmBorder', 'Realm borders', {default: true}),
    Type.boolean('showRegions', 'Regions', {default: false}),
    Type.boolean('showBorderRegion', 'Border region', {default: false}),
    Type.boolean('showCornerRegion', 'Corner region', {default: false}),
)


class RealmColorMap {
    #regionMap
    #realmMap

    constructor(realmTileMap) {
        const randColor = _ => [_, new Color()]
        const realmEntries = realmTileMap.map(randColor)
        const regionEntries = realmTileMap.mapRegions(randColor)
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
        this.showCenters = params.get('showCenters')
        this.showRegions = params.get('showRegions')
        this.showRealmBorder = params.get('showRealmBorder')
        this.showBorderRegion = params.get('showBorderRegion')
        this.showCornerRegion = params.get('showCornerRegion')
    }

    get(_point) {
        const point = this.tileMap.rect.wrap(_point)
        const realm = this.tileMap.getRealm(point)
        const realmOrigin = this.tileMap.getRealmOrigin(point)
        const region = this.tileMap.getRegion(point)
        const realmColor = this.colorMap.getByRealm(realm)
        const regionColor = this.colorMap.getByRegion(region)
        let color = realmColor

        if (this.showCenters && Point.equals(realmOrigin, point)) {
            return realmColor.invert()
        }
        if (this.showRealmBorder && this.tileMap.isRealmBorder(point)) {
            return Color.BLACK.average(realmColor)
        }
        if (this.showRegions) {
            color = regionColor.average(realmColor).average(realmColor)
        }
        if (this.showBorderRegion && this.tileMap.isBorderRegion(region)) {
            color = color.average(Color.BLACK)
        }
        if (this.showCornerRegion && this.tileMap.isCornerRegion(region)) {
            color = (point[0] + point[1]) % 2 ? color.darken(80) : color
        }
        return color
    }
}
