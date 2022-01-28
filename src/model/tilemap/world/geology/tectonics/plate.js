import { Direction } from '/lib/direction'
import { Random } from '/lib/random'


const TYPE_CONTINENTAL = 'L'
const TYPE_OCEANIC = 'W'
const HOTSPOT_CHANCE = .4
const CRATON_CHANCE = .5


export class PlateModel {
    #directionMap = new Map()
    #hotspotMap = new Map()
    #cratonMap = new Map()
    #weightMap = new Map()
    #regionTileMap
    #typeMap
    #plates

    constructor(regionTileMap) {
        this.#regionTileMap = regionTileMap
        this.#plates = this._buildPlates(regionTileMap)
        this.#typeMap = this._buildTypeMap(this.#plates)
        this.#plates.forEach(plateId => {
            this.#weightMap.set(plateId, this._getWeight(plateId))
            this.#hotspotMap.set(plateId, Random.chance(HOTSPOT_CHANCE))
            this.#cratonMap.set(plateId, Random.chance(CRATON_CHANCE))
            this.#directionMap.set(plateId, Direction.random())
        })
    }

    _buildPlates(regionTileMap) {
        // sort by bigger to smaller plates
        const cmpDescendingArea = (id0, id1) => {
            const area0 = regionTileMap.getRegionAreaById(id0)
            const area1 = regionTileMap.getRegionAreaById(id1)
            return area1 - area0
        }
        return regionTileMap.getRegions().sort(cmpDescendingArea)
    }

    _buildTypeMap(plates) {
        let totalOceanicArea = 0
        const halfArea = Math.floor(this.#regionTileMap.area / 2)
        const types = new Map()
        plates.forEach(plateId => {
            totalOceanicArea += this.#regionTileMap.getRegionAreaById(plateId)
            const isOceanic = totalOceanicArea < halfArea
            const type = isOceanic ? TYPE_OCEANIC : TYPE_CONTINENTAL
            types.set(plateId, type)
        })
        return types
    }

    _getWeight(plateId) {
        const type = this.#typeMap.get(plateId)
        const multiplier = this.#plates.length * 100
        const weight = type === TYPE_OCEANIC ? multiplier : 0
        return plateId + weight
    }

    get size() {
        return this.#plates.length
    }

    getPlates() {
        return this.#plates
    }

    getDirection(plateId) {
        return this.#directionMap.get(plateId)
    }

    getWeight(plateId) {
        return this.#weightMap.get(plateId)
    }

    getArea(plateId) {
        return this.#regionTileMap.getRegionAreaById(plateId)
    }

    isOceanic(plateId) {
        return this.#typeMap.get(plateId) === TYPE_OCEANIC
    }

    hasHotspot(plateId) {
        return this.#hotspotMap.get(plateId)
    }

    hasCraton(plateId) {
        return this.#cratonMap.get(plateId)
    }

    forEach(callback) {
        this.#plates.forEach(callback)
    }

    map(callback) {
        this.#plates.map(callback)
    }
}
