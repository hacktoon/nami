import { Direction } from '/lib/direction'
import { Random } from '/lib/random'


const TYPE_CONTINENTAL = 'L'
const TYPE_OCEANIC = 'W'
const HOTSPOT_CHANCE = .4


export class PlateMap {
    constructor(realmTileMap) {
        this._directionTable = []
        this._weightTable = []
        this._hasHotspot = []
        this._plateTableMap = new Map()
        this._realmTileMap = realmTileMap
        this._plates = realmTileMap.getRealmsDescOrder()
        this.typeMap = this._buildTypes(this._plates)
        this._plates.forEach((plateId, id) => {
            const isLandlocked = this._isLandLocked(plateId)
            const type = isLandlocked ? TYPE_OCEANIC : this.typeMap.get(plateId)
            const weight = id+(type === TYPE_OCEANIC ? this._plates.length * 10 : 0)
            this._plateTableMap.set(plateId, id)
            this._hasHotspot.push(Random.chance(HOTSPOT_CHANCE))
            this._directionTable.push(Direction.random())
            this._weightTable.push(id + weight)
        })
    }

    _isLandLocked(plateId) {
        return this._realmTileMap.getNeighborRealms(plateId)
            .concat(plateId)
            .every(neighborId => {
                return this.typeMap.get(neighborId) === TYPE_CONTINENTAL
            })
    }

    _buildTypes(realms) {
        let totalOceanicArea = 0
        const halfArea = Math.floor(this._realmTileMap.area / 2)
        const types = new Map()
        realms.forEach(realmId=> {
            totalOceanicArea += this._realmTileMap.getRealmAreaById(realmId)
            const isOceanic = totalOceanicArea < halfArea
            const type = isOceanic ? TYPE_OCEANIC : TYPE_CONTINENTAL
            types.set(realmId, type)
        })
        return types
    }

    get size() {
        return this._plates.size
    }

    getDirection(plateId) {
        const id = this._plateTableMap.get(plateId)
        return this._directionTable[id]
    }

    getWeight(plateId) {
        const id = this._plateTableMap.get(plateId)
        return this._weightTable[id]
    }

    isOceanic(plateId) {
        return this.typeMap.get(plateId) === TYPE_OCEANIC
    }

    hasHotspot(plateId) {
        const id = this._plateTableMap.get(plateId)
        return this._hasHotspot[id]
    }

    forEach(callback) {
        this._plates.forEach(callback)
    }

    map(callback) {
        this._plates.map(callback)
    }
}
