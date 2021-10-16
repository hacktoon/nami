import { Direction } from '/lib/direction'
import { Random } from '/lib/random'


const TYPE_CONTINENTAL = 'L'
const TYPE_OCEANIC = 'W'
const HOTSPOT_CHANCE = .4


export class PlateMap {
    constructor(realmTileMap) {
        this.plates = new Map()
        this.realmTileMap = realmTileMap
        const realms = realmTileMap.getRealmsDescOrder()
        const typeMap = this._buildTypes(realms)

        this.directions = []
        this.types = []
        this.weights = []
        this._hasHotspot = []

        realms.forEach(realmId => {
            const isLandlocked = realmTileMap.getNeighborRealms(realmId)
                .concat(realmId)
                .every(neighborId => {
                    return typeMap.get(neighborId) === TYPE_CONTINENTAL
                })
            const type = isLandlocked ? TYPE_OCEANIC : typeMap.get(realmId)
            const baseWeight = (type === TYPE_OCEANIC ? realms.length * 10 : 0)
            this.weights.push(realmId + baseWeight)
            this.directions.push(Direction.random())
            this.types.push(type)
            this._hasHotspot.push(Random.chance(HOTSPOT_CHANCE))
        })
    }

    _buildTypes(realms) {
        const halfWorldArea = Math.floor(this.realmTileMap.area / 2)
        const typeMap = new Map()
        let totalOceanicArea = 0
        realms.forEach(realmId => {
            totalOceanicArea += this.realmTileMap.getRealmAreaById(realmId)
            const isOceanic = totalOceanicArea < halfWorldArea
            const type = isOceanic ? TYPE_OCEANIC : TYPE_CONTINENTAL
            typeMap.set(realmId, type)
        })
        return typeMap
    }

    get size() {
        return this.plates.size
    }

    getDirection(plateId) {
        return this.directions[plateId]
    }

    getWeight(plateId) {
        return this.weights[plateId]
    }

    isOceanic(plateId) {
        return this.types[plateId] === TYPE_OCEANIC
    }

    hasHotspot(plateId) {
        return this._hasHotspot[plateId]
    }

    forEach(callback) {
        this.plates.forEach(callback)
    }

    map(callback) {
        this.plates.map(callback)
    }
}
