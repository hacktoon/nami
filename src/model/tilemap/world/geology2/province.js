import { SingleFillUnit } from '/lib/floodfill/single'
import { Random } from '/lib/random'


const TYPES = [
    {name: 'Mountain', water: false, color: '#9A9'},
    {name: 'Platform', water: false, color: '#949472'},
    {name: 'Hill', water: false, color: '#685'},
    {name: 'Plain', water: false, color: '#574'},
    {name: 'Island', water: true, color: '#574'},
    {name: 'Shallow sea', water: true, color: '#058'},
    {name: 'Deep sea', water: true, color: '#147'},
]


export class ProvinceModel {
    #realmTileMap
    #provinces
    #typeMap = new Map()

    #buildTypeMap(realmTileMap, continentModel) {
        realmTileMap.getRegions().map(region => {
            const continent = realmTileMap.getRealmByRegion(region)
            const sideRegions = realmTileMap.getSideRegions(region)
            const isOceanic = continentModel.isOceanic(continent)
            if (this.#realmTileMap.isCornerRegion(region)) {
                this.#typeMap.set(region, TYPES[5])
                return
            }
            for(let sideRegion of sideRegions) {
                const sideContinent = realmTileMap.getRealmByRegion(sideRegion)
                if (continent === sideContinent) continue
                const hasLink = continentModel.hasLink(continent, sideContinent)
                const isSideOceanic = continentModel.isOceanic(sideContinent)
                if (! hasLink && ! isOceanic && ! isSideOceanic) {
                    this.#typeMap.set(region, TYPES[5])
                    return
                }
                if (hasLink && isOceanic && isSideOceanic) {
                    this.#typeMap.set(region, TYPES[6])
                    return
                }
            }
            if (isOceanic) {
                this.#typeMap.set(region, TYPES[5])
            } else {
                this.#typeMap.set(region, TYPES[3])
            }

        })
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
