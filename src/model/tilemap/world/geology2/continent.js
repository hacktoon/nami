import { SingleFillUnit } from '/lib/floodfill/single'
import { IndexMap } from '/lib/map'
import { Graph } from '/lib/graph'
import { Point } from '/lib/point'


const TYPE_LAND = 0
const TYPE_OCEAN = 1


export class ContinentModel {
    #realmTileMap
    #continents = []
    #typeMap = new Map()
    #continentGroupMap = new Map()
    #continentGroups = []
    #links = new Graph()

    #buildContinents(realmTileMap) {
        let totalOceanicArea = 0
        const halfArea = Math.floor(realmTileMap.area / 2)
        // sort by bigger to smaller continents
        const cmpDescendingArea = (id0, id1) => {
            const area0 = realmTileMap.getArea(id0)
            const area1 = realmTileMap.getArea(id1)
            return area1 - area0
        }
        const continents = this.#realmTileMap.getRealms().sort(cmpDescendingArea)
        for (let continent of continents) {
            totalOceanicArea += realmTileMap.getArea(continent)
            const isOceanic = totalOceanicArea < halfArea
            this.#typeMap.set(continent, isOceanic ? TYPE_OCEAN : TYPE_LAND)
            this.#continents.push(continent)
        }
    }

    #buildContinentGroups(params, realmTileMap) {
        const continentRate = params.get('continentRate')
        const continentQueue = new IndexMap(this.#continents)
        const maxGroupSize = Math.round(this.#continents.length * continentRate)
        const groupSizeMap = new Map()
        let groupId = 0
        while(continentQueue.size > 0) {
            const continent = continentQueue.random()
            groupSizeMap.set(groupId, 0)
            this.#continentGroups.push(groupId)
            new ContinentGroupFloodFill(continent, {
                continentGroupMap: this.#continentGroupMap,
                typeMap: this.#typeMap,
                groupId: groupId++,
                continentQueue,
                maxGroupSize,
                groupSizeMap,
                realmTileMap,
            }).growFull()
        }
    }

    #buildContinentLinks(realmTileMap) {
        for(let continent of realmTileMap.getRealms()) {
            const sideContinents = realmTileMap.getSideRealms(continent)
            const group = this.#continentGroupMap.get(continent)
            for(let sideContinent of sideContinents) {
                const sideGroup = this.#continentGroupMap.get(sideContinent)
                if (group === sideGroup) {
                    this.#links.setEdge(continent, sideContinent)
                }
            }
        }
    }

    constructor(params, realmTileMap) {
        this.#realmTileMap = realmTileMap
        this.#buildContinents(realmTileMap)
        this.#buildContinentGroups(params, realmTileMap)
        this.#buildContinentLinks(realmTileMap)
    }

    get size() {
        return this.#continents.length
    }

    get ids() {
        return this.#continents
    }

    get groups() {
        return this.#continentGroups
    }

    get(point) {
        return this.#realmTileMap.getRealm(point)
    }

    getArea(continent) {
        return this.#realmTileMap.getArea(continent)
    }

    getContinents() {
        return this.#realmTileMap.getRealms()
    }

    isOceanic(continent) {
        return this.#typeMap.get(continent) === TYPE_OCEAN
    }

    hasLink(continent, sideContinent) {
        return this.#links.hasEdge(continent, sideContinent)
    }

    getOrigin(point) {
        return this.#realmTileMap.getRealmOrigin(point)
    }

    getGroup(continent) {
        return this.#continentGroupMap.get(continent)
    }

    isBorder(point) {
        return this.#realmTileMap.isRealmBorder(point)
    }

    isOrigin(point) {
        const origin = this.getOrigin(point)
        return Point.equals(origin, point)
    }

    forEach(callback) {
        this.#continents.forEach(callback)
    }

    map(callback) {
        return this.#continents.map(callback)
    }
}



class ContinentGroupFloodFill extends SingleFillUnit {
    setValue(continent, level) {
        const {groupId, groupSizeMap} = this.context
        const currentGroupSize = groupSizeMap.get(groupId)
        this.context.continentGroupMap.set(continent, groupId)
        this.context.continentQueue.delete(continent)
        groupSizeMap.set(groupId, currentGroupSize + 1)
    }

    isEmpty(continent) {
        const {typeMap, groupId, groupSizeMap} = this.context
        const currentGroupSize = groupSizeMap.get(groupId)
        const sameType = typeMap.get(this.origin) === typeMap.get(continent)
        const ungrouped = ! this.context.continentGroupMap.has(continent)
        const validGroupSize = currentGroupSize <= this.context.maxGroupSize
        return sameType && ungrouped && validGroupSize
    }

    getNeighbors(continent) {
        const realmTileMap = this.context.realmTileMap
        const cmpDescendingArea = (id0, id1) => {
            const area0 = realmTileMap.getArea(id0)
            const area1 = realmTileMap.getArea(id1)
            return area1 - area0
        }
        return realmTileMap.getSideRealms(continent).sort(cmpDescendingArea)
    }
}
