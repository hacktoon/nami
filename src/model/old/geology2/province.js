import { ConcurrentFillSchedule, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Random } from '/src/lib/random'


const TYPES = [
    {name: 'Mountain', water: false, color: '#AAA'},
    {name: 'Platform', water: false, color: '#949472'},
    {name: 'Hill', water: false, color: '#685'},
    {name: 'Plain', water: false, color: '#574'},
    {name: 'Island', water: false, color: '#087'},
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


class ProvinceMultiFill extends ConcurrentFillSchedule {
    constructor(regions, context) {
        super(regions, ProvinceFloodFill, context)
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
        const sideProvinces = realmTileMap.getSideRegions(province)
        const continent = realmTileMap.getRealmByRegion(province)
        const isOceanic = continentModel.isOceanic(continent)
        const isCorner = realmTileMap.isCornerRegion(province)
        let type = TYPES[3] // plain

        if (realmTileMap.isBorderRegion(province)) {
            for(let sideProvince of sideProvinces) {
                const sideContinent = realmTileMap.getRealmByRegion(sideProvince)
                if (continent === sideContinent) {
                    continue
                }
                const hasLink = continentModel.hasLink(continent, sideContinent)
                const isSideOceanic = continentModel.isOceanic(sideContinent)
                const isOceansLinked = isOceanic && isSideOceanic
                if (isCorner) {
                    type = isOceansLinked ? TYPES[6] : TYPES[Random.choice(5, 6)]
                    break
                }
                if (hasLink) {
                    const landIndex = Random.choice(0, 1, 2, 2, 3, 3, 3)
                    type = isOceansLinked ? TYPES[6] : TYPES[landIndex]
                    break
                }
                type = isSideOceanic ? TYPES[5] : TYPES[6]
            }
        } else {
            const choices = isOceanic
                ? [4, 5, 6, 6, 6, 6, 6, 6, 6, 6]
                : [0, 1, 2, 3, 3, 3]
            type = TYPES[Random.choiceFrom(choices)]
        }
        fill.context.typeMap.set(province, type)
        return sideProvinces
    }
}
