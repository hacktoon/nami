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
        realmTileMap.getRegions().map(province => {
            const continent = realmTileMap.getRealmByRegion(province)
            const sideProvinces = realmTileMap.getSideRegions(province)
            for(let sideProvince of sideProvinces) {
                const sideContinent = realmTileMap.getRealmByRegion(sideProvince)
                const sameGroup = continentModel.sameGroup(continent, sideContinent)
            }
            if (continentModel.isOceanic(continent)) {
                this.#typeMap.set(province, TYPES[5])
            } else {
                this.#typeMap.set(province, TYPES[3])
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
