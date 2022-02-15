import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'
import { Random } from '/lib/random'


const TYPES = [
    {name: 'Mountain', water: false, color: '#9A9'},
    {name: 'Platform', water: false, color: '#949472'},
    {name: 'Hill', water: false, color: '#685'},
    {name: 'Plain', water: false, color: '#574'},
    {name: 'Island', water: true, color: '#574'},
    {name: 'Shallow sea', water: true, color: '#058'},
    {name: 'Deep sea', water: true, color: '#047'},
]


export class ProvinceModel {
    #realmTileMap
    #provinces
    #typeMap = new Map()

    #buildTypeMap(realmTileMap, continentModel) {
        const origins = realmTileMap.getBorderRegions()
        new ProvinceMultiFill(origins, {
            realmTileMap,
            continentModel,
            typeMap: this.#typeMap,
            fillSet: new Set(),
        }).fill()
    }

    constructor(realmTileMap, continentModel) {
        this.#realmTileMap = realmTileMap
        this.#provinces = realmTileMap.getRegions()
        this.#buildTypeMap(realmTileMap, continentModel)
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


class ProvinceMultiFill extends ConcurrentFill {
    constructor(regions, context) {
        super(regions, ProvinceFloodFill, context)
    }

    getChance(fill, origin) {
        return .2
    }

    getGrowth(fill, origin) {
        return 2
    }
}


class ProvinceFloodFill extends ConcurrentFillUnit {
    setValue(fill, province, level) {
        fill.context.fillSet.add(province)
    }

    isEmpty(fill, province) {
        return ! fill.context.fillSet.has(province)
    }

    getNeighbors(fill, province) {
        const {realmTileMap, continentModel} = fill.context
        const continent = realmTileMap.getRealmByRegion(province)
        const isCorner = realmTileMap.isCornerRegion(province)
        const isBorder = realmTileMap.isBorderRegion(province)
        const isOceanic = continentModel.isOceanic(continent)
        const sideProvinces = realmTileMap.getSideRegions(province)
        let type = TYPES[3] // plain

        if (isCorner) {
            type = TYPES[5]
        } else if (isBorder) {
            for(let sideProvince of sideProvinces) {
                const sideContinent = realmTileMap.getRealmByRegion(sideProvince)
                if (continent === sideContinent) {
                    continue
                }
                const hasLink = continentModel.hasLink(continent, sideContinent)
                const isSideOceanic = continentModel.isOceanic(sideContinent)
                if (! hasLink && ! isSideOceanic) {
                    type = TYPES[5]
                } else if (hasLink && isOceanic && isSideOceanic) {
                    type = TYPES[6]
                }
            }
        } else {
            const choices = isOceanic ? [5, 6] : [1, 2, 3]
            type = TYPES[Random.choiceFrom(choices)]
            // console.log(type);
        }
        fill.context.typeMap.set(province, type)
        return sideProvinces
    }
}
