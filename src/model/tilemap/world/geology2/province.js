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

    constructor(realmTileMap, continentModel) {
        this.#realmTileMap = realmTileMap
        this.#provinces = realmTileMap.getRegions()
        realmTileMap.getBorderRegions().map(region => {

            return region
        })
    }

    get size() {
        return this.#provinces.length
    }

    get(point) {
        return this.#realmTileMap.getRegion(point)
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
