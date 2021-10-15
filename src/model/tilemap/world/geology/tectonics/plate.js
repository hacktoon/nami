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
        realms.forEach(realmId => {
            const origin = realmTileMap.getRealmOriginById(realmId)
            const area = realmTileMap.getRealmAreaById(realmId)
            const isLandlocked = realmTileMap.getNeighborRealms(realmId)
                .concat(realmId)
                .every(neighborId => {
                    return typeMap.get(neighborId) === TYPE_CONTINENTAL
                })
            const type = isLandlocked ? TYPE_OCEANIC : typeMap.get(realmId)
            const baseWeight = (type === TYPE_OCEANIC ? realms.length * 10 : 0)
            const weight = realmId + baseWeight
            const plate = new Plate(realmId, origin, type, area, weight)
            this.plates.set(plate.id, plate)
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

    get(id) {
        return this.plates.get(id)
    }

    isOceanic(plateId) {
        return this.plates.get(plateId).type === TYPE_OCEANIC
    }

    isContinental(plateId) {
        return this.plates.get(plateId).type === TYPE_CONTINENTAL
    }

    forEach(callback) {
        this.plates.forEach(callback)
    }

    map(callback) {
        this.plates.map(callback)
    }

    values() {
        return this.plates.values()
    }
}


class Plate {
    constructor(id, origin, type, area, weight) {
        this.id = id
        this.type = type
        this.area = area
        this.origin = origin
        this.direction = Direction.random()
        this.hasHotspot = Random.chance(HOTSPOT_CHANCE)
        this.weight = weight
    }

    isOceanic() {
        return this.type === TYPE_OCEANIC
    }

    isContinental() {
        return this.type === TYPE_CONTINENTAL
    }
}
