import { Direction } from '/lib/base/direction'
import { Random } from '/lib/base/random'


const TYPE_CONTINENTAL = 'L'
const TYPE_OCEANIC = 'W'


class Plate {
    constructor(id, origin, type, area, weight) {
        this.id = id
        this.type = type
        this.area = area
        this.origin = origin
        this.direction = Direction.random()
        this.weight = weight
        this.color = type === TYPE_OCEANIC ? '#058' : '#1c7816'
    }

    isOceanic() {
        return this.type === TYPE_OCEANIC
    }

    isContinental() {
        return this.type === TYPE_CONTINENTAL
    }
}


export class PlateMap {
    constructor(regionGroupTileMap) {
        this.regionGroupTileMap = regionGroupTileMap
        this.plates = new Map()
        const cmpDescendingCount = (g0, g1) => g1.count - g0.count
        const groups = this.regionGroupTileMap.getGroups().sort(cmpDescendingCount)
        const typeMap = this._buildTypes(groups)
        groups.forEach(group => {
            const neighborsGroups = this.regionGroupTileMap.getNeighborGroups(group)
            const isLandlocked = neighborsGroups.concat(group).every(neighbor => {
                return typeMap.get(neighbor.id) === TYPE_CONTINENTAL
            })
            const type = isLandlocked ? TYPE_OCEANIC : typeMap.get(group.id)
            const weight = group.id + (type === TYPE_OCEANIC ? groups.length * 10 : 0)
            const plate = new Plate(group.id, group.origin, type, group.area, weight)
            this.plates.set(plate.id, plate)
        })
    }

    _buildTypes(groups) {
        const halfWorldArea = Math.floor(this.regionGroupTileMap.area / 2)
        const typeMap = new Map()
        let totalOceanicArea = 0
        groups.forEach(group => {
            totalOceanicArea += group.area
            const isOceanic = totalOceanicArea < halfWorldArea
            const type = isOceanic ? TYPE_OCEANIC : TYPE_CONTINENTAL
            typeMap.set(group.id, type)
        })
        return typeMap
    }

    get(id) {
        return this.plates.get(id)
    }

    map(callback) {
        return Array.from(this.plates.values()).map(plate => callback(plate))
    }

    forEach(callback) {
        this.plates.forEach(callback)
    }
}

