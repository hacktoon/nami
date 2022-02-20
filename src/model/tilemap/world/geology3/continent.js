import { SingleFillUnit } from '/src/lib/floodfill/single'
import { IndexMap } from '/src/lib/map'
import { Graph } from '/src/lib/graph'
import { Point } from '/src/lib/point'


const TYPE_LAND = 0
const TYPE_OCEAN = 1


export class ContinentModel {
    #regionTileMap
    #continents = []
    #typeMap = new Map()
    #continentGroupMap = new Map()
    #groupOrigin = new Map()
    #continentGroups = []
    #links = new Graph()

    #buildContinents(regionTileMap) {
        let totalOceanicArea = 0
        const halfArea = Math.floor(regionTileMap.area / 2)
        // sort by bigger to smaller continents
        const cmpDescendingArea = (id0, id1) => {
            const area0 = regionTileMap.getArea(id0)
            const area1 = regionTileMap.getArea(id1)
            return area1 - area0
        }
        const continents = this.#regionTileMap.getRegions().sort(cmpDescendingArea)
        for (let continent of continents) {
            totalOceanicArea += regionTileMap.getArea(continent)
            const isOceanic = totalOceanicArea < halfArea
            this.#typeMap.set(continent, isOceanic ? TYPE_OCEAN : TYPE_LAND)
            this.#continents.push(continent)
        }
    }

    #buildContinentGroups(params, regionTileMap) {
        const continentRate = params.get('continentRate')
        const continentQueue = new IndexMap(this.#continents)
        const maxGroupSize = Math.round(this.#continents.length * continentRate)
        const groupSizeMap = new Map()
        let group = 0
        while(continentQueue.size > 0) {
            const continent = continentQueue.random()
            groupSizeMap.set(group, 0)
            this.#continentGroups.push(group)
            new ContinentGroupFloodFill(continent, {
                continentGroupMap: this.#continentGroupMap,
                typeMap: this.#typeMap,
                groupOrigin: this.#groupOrigin,
                group: group++,
                continentQueue,
                maxGroupSize,
                groupSizeMap,
                regionTileMap,
            }).growFull()
        }
    }

    #buildContinentLinks(regionTileMap) {
        for(let continent of regionTileMap.getRegions()) {
            const sideContinents = regionTileMap.getSideRegions(continent)
            const group = this.#continentGroupMap.get(continent)
            for(let sideContinent of sideContinents) {
                const sideGroup = this.#continentGroupMap.get(sideContinent)
                if (group === sideGroup) {
                    this.#links.setEdge(continent, sideContinent)
                }
            }
        }
    }

    constructor(params, regionTileMap) {
        this.#regionTileMap = regionTileMap
        this.#buildContinents(regionTileMap)
        this.#buildContinentGroups(params, regionTileMap)
        this.#buildContinentLinks(regionTileMap)
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
        return this.#regionTileMap.getRegion(point)
    }

    getArea(continent) {
        return this.#regionTileMap.getArea(continent)
    }

    getContinents() {
        return this.#regionTileMap.getRegions()
    }

    getGroup(continent) {
        return this.#continentGroupMap.get(continent)
    }

    getGroupOrigin(group) {
        return this.#groupOrigin.get(group)
    }

    isOceanic(continent) {
        return this.#typeMap.get(continent) === TYPE_OCEAN
    }

    hasLink(continent, sideContinent) {
        return this.#links.hasEdge(continent, sideContinent)
    }

    isBorder(point) {
        return this.#regionTileMap.isBorder(point)
    }

    isOrigin(point) {
        const origin = this.#regionTileMap.getRegionOrigin(point)
        return Point.equals(origin, point)
    }

    forEach(callback) {
        this.#continents.forEach(callback)
    }

    map(callback) {
        return this.#continents.map(callback)
    }
}


/**
 * Fills the regions creating groups of continents
 */
class ContinentGroupFloodFill extends SingleFillUnit {
    setValue(continent, level) {
        const {regionTileMap, group, groupSizeMap} = this.context
        const origin = regionTileMap.getOriginById(continent)
        const currentGroupSize = groupSizeMap.get(group)
        this.context.continentGroupMap.set(continent, group)
        this.context.continentQueue.delete(continent)
        this.context.groupOrigin.set(group, origin)
        groupSizeMap.set(group, currentGroupSize + 1)
    }

    isEmpty(continent) {
        const {typeMap, group, groupSizeMap} = this.context
        const currentGroupSize = groupSizeMap.get(group)
        const sameType = typeMap.get(this.origin) === typeMap.get(continent)
        const ungrouped = ! this.context.continentGroupMap.has(continent)
        const validGroupSize = currentGroupSize <= this.context.maxGroupSize
        return sameType && ungrouped && validGroupSize
    }

    getNeighbors(continent) {
        return this.context.regionTileMap.getSideRegions(continent)
    }
}
