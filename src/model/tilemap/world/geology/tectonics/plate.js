import { Direction } from '/lib/direction'
import { Random } from '/lib/random'


const TYPE_CONTINENTAL = 'L'
const TYPE_OCEANIC = 'W'
const HOTSPOT_CHANCE = .4


export class PlateMap {
    constructor(realmTileMap) {
        this.directions = []
        this._weightTable = []
        this._hasHotspot = []
        this._plateTableMap = new Map()
        this.realmTileMap = realmTileMap
        this.plates = realmTileMap.getRealmsDescOrder()
        this.types = this._buildTypes(this.plates)
        this.plates.forEach((plateId, id) => {
            const isLandlocked = realmTileMap.getNeighborRealms(plateId)
                .concat(plateId)
                .every(neighborId => {
                    return this.types[neighborId] === TYPE_CONTINENTAL
                })
            const type = isLandlocked ? TYPE_OCEANIC : this.types[plateId]
            const weight = id+(type === TYPE_OCEANIC ? this.plates.length * 10 : 0)
            console.log(id, weight, this.types[id]);
            this._plateTableMap.set(plateId, id)
            this._hasHotspot.push(Random.chance(HOTSPOT_CHANCE))
            this.directions.push(Direction.random())
            this._weightTable.push(id + weight)
        })
        console.log(this._weightTable);
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
        const id = this._plateTableMap.get(plateId)
        return this.directions[id]
    }

    getWeight(plateId) {
        const id = this._plateTableMap.get(plateId)
        return this._weightTable[id]
    }

    isOceanic(plateId) {
        const id = this._plateTableMap.get(plateId)
        return this.types[id] === TYPE_OCEANIC
    }

    hasHotspot(plateId) {
        const id = this._plateTableMap.get(plateId)
        return this._hasHotspot[id]
    }

    forEach(callback) {
        this.plates.forEach(callback)
    }

    map(callback) {
        this.plates.map(callback)
    }
}
