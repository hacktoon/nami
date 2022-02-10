import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'
import { Random } from '/lib/random'
import { PairMap } from '/lib/map'

const TYPE_LAND = 0
const TYPE_OCEAN = 1


export class ProvinceModel {
    #realmTileMap
    #provinces
    #borderMap
    #typeMap = new Map()

    constructor(realmTileMap, continentModel) {
        this.#realmTileMap = realmTileMap
        this.#provinces = realmTileMap.getRegions()
        this.#borderMap = this._buildBorderMap(realmTileMap, continentModel)
        const origins = realmTileMap.getBorderRegions().map(region => {
            // this.#typeMap.set(region, 1)
            return region
        })
        const fillSet = new Set()
        const context = {
            typeMap: this.#typeMap,
            continentModel,
            realmTileMap,
            fillSet,
        }
        new ProvinceConcurrentFill(origins, context).fill()
    }

    _buildBorderMap(realmTileMap, continentModel) {
        const borderMap = new PairMap()
        for(let continent of realmTileMap.getRealms()) {
            const sideContinents = realmTileMap.getSideRealms(continent)
            for(let sideContinent of sideContinents) {
                const border = Random.chance(.5) ? TYPE_OCEAN : TYPE_LAND
                borderMap.set(continent, sideContinent, border)
            }
        }
        return borderMap
    }

    get size() {
        return this.#provinces.length
    }

    get(point) {
        return this.#realmTileMap.getRegion(point)
    }

    getType(province) {
        return this.#typeMap.get(province)
    }

    isCorner(province) {
        return this.#realmTileMap.isCornerRegion(province)
    }

    isBorder(point) {
        return this.#realmTileMap.isRegionBorder(point)
    }

    isBorderProvince(province) {
        return this.#realmTileMap.isBorderRegion(province)
    }

    forEach(callback) {
        this.#provinces.forEach(callback)
    }

    map(callback) {
        return this.#provinces.map(callback)
    }
}


class ProvinceConcurrentFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, ProvinceFloodFill, context)
    }
    getChance(fill, origin) { return .5 }
    getGrowth(fill, origin) { return 1 }
}


class ProvinceFloodFill extends ConcurrentFillUnit {
    setValue(fill, region, level) {
        fill.context.fillSet.add(region)
    }

    isEmpty(fill, region) {
        return ! fill.context.fillSet.has(region)
    }

    checkNeighbor(fill, sideRegion, centerRegion) {
        const {realmTileMap, continentModel} = fill.context
        if (this.isEmpty(fill, sideRegion)) return
        const continent = realmTileMap.getRealmByRegion(centerRegion)
        const sideContinent = realmTileMap.getRealmByRegion(sideRegion)
        if (continent !== sideContinent) {

            // fill.context.typeMap.set(centerRegion, type)
        }
        if (continent < sideContinent) {

        }
    }

    getNeighbors(fill, region) {
        return fill.context.realmTileMap.getSideRegions(region)
    }
}
