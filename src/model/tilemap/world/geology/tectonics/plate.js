import { Direction } from '/lib/direction'
import { Random } from '/lib/random'


const TYPE_CONTINENTAL = 'L'
const TYPE_OCEANIC = 'W'
const HOTSPOT_CHANCE = .4


export class PlateMap {
    constructor(realmTileMap) {
        const realms = realmTileMap.getRealmsDescOrder()
        this.plates = new Map()
        this.realmTileMap = realmTileMap
        this.types = this._buildTypes(realms)

        this.directions = []
        this.weights = []
        this._hasHotspot = []

        realms.forEach(realmId => {
            const isLandlocked = realmTileMap.getNeighborRealms(realmId)
                .concat(realmId)
                .every(neighborId => {
                    return this.types[neighborId] === TYPE_CONTINENTAL
                })
            const type = isLandlocked ? TYPE_OCEANIC : this.types[realmId]
            const baseWeight = (type === TYPE_OCEANIC ? realms.length * 10 : 0)
            this._hasHotspot.push(Random.chance(HOTSPOT_CHANCE))
            this.directions.push(Direction.random())
            this.weights.push(realmId + baseWeight)
        })
    }

    _buildTypes(realms) {
        const types = []
        const halfWorldArea = Math.floor(this.realmTileMap.area / 2)
        let totalOceanicArea = 0
        realms.forEach(realmId => {
            totalOceanicArea += this.realmTileMap.getRealmAreaById(realmId)
            const isOceanic = totalOceanicArea < halfWorldArea
            const type = isOceanic ? TYPE_OCEANIC : TYPE_CONTINENTAL
            types.push(type)
        })
        return types
    }

    get size() {
        return this.realmTileMap.size
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
