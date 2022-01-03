import { Direction } from '/lib/direction'
import { Random } from '/lib/random'


const TYPE_CONTINENTAL = 'L'
const TYPE_OCEANIC = 'W'
const HOTSPOT_CHANCE = .4


export class PlateModel {
    constructor(regionTileMap) {
        this._directionTable = []
        this._weightTable = []
        this._hasHotspot = []
        this._plateTableMap = new Map()
        this._regionTileMap = regionTileMap
        this._plates = this._getRegionsDescOrder(regionTileMap)
        this._typeMap = this._buildTypes(this._plates)
        this._plates.forEach((plateId, id) => {
            const isLandlocked = this._isLandLocked(plateId)
            const type = isLandlocked ? TYPE_OCEANIC : this._typeMap.get(plateId)
            const weight = id+(type === TYPE_OCEANIC ? this._plates.length * 10 : 0)
            this._plateTableMap.set(plateId, id)
            this._hasHotspot.push(Random.chance(HOTSPOT_CHANCE))
            this._directionTable.push(Direction.random())
            this._weightTable.push(id + weight)
        })
    }

    _getRegionsDescOrder(regionTileMap) {
        const cmpDescendingArea = (id0, id1) => {
            const area0 = regionTileMap.getRegionAreaById(id0)
            const area1 = regionTileMap.getRegionAreaById(id1)
            return area1 - area0
        }
        return regionTileMap.getRegions().sort(cmpDescendingArea)
    }

    _isLandLocked(plateId) {
        return this._regionTileMap.getSideRegions(plateId)
            .concat(plateId)
            .every(neighborId => {
                return this._typeMap.get(neighborId) === TYPE_CONTINENTAL
            })
    }

    _buildTypes(plates) {
        let totalOceanicArea = 0
        const halfArea = Math.floor(this._regionTileMap.area / 2)
        const types = new Map()
        plates.forEach(plateId=> {
            totalOceanicArea += this._regionTileMap.getRegionAreaById(plateId)
            const isOceanic = totalOceanicArea < halfArea
            const type = isOceanic ? TYPE_OCEANIC : TYPE_CONTINENTAL
            types.set(plateId, type)
        })
        return types
    }

    get size() {
        return this._plates.length
    }

    getPlates() {
        return this._regionTileMap.getRegions()
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
        return this._typeMap.get(plateId) === TYPE_OCEANIC
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
