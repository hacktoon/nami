import { Grid } from '/lib/grid'
import { Name } from '/lib/name'
import { ScanlineFill8 } from '/lib/flood-fill'


const EMPTY = 0

const OCEAN = 0
const SEA = 1
const LAKE = 2
const POND = 3

const WATERBODY_MIN_AREA_TABLE = [
    { id: OCEAN, percentage: 8 },
    { id: SEA,   percentage: 1 },
    { id: LAKE,  percentage: 0.016 },
    { id: POND,  percentage: 0 }
]

const WATERBODY_TABLE = [
    { id: OCEAN, color: "#0c2e63", name: "Ocean" },
    { id: SEA, color: "#8bddd4", name: "Sea" },
    { id: LAKE, color: "#29f25e", name: "Lake" },
    { id: POND, color: "#29f25e", name: "Pond" }
]


/* Maps contiguous areas of a water's surface */
class WaterGrid {
    constructor(reliefMap) {
        this.currentID    = 1
        this.shorePoints  = []
        this.waterPoints  = []
        this.waterMap = {}
        this.reliefMap    = reliefMap
        this.grid         = this._buildGrid(reliefMap.size)
        this._buildMap()
    }

    _buildGrid(size) {
        return new Grid(size, size, point => {
            if (this.reliefMap.isWater(point)) {
                this.waterPoints.push(point)
            }
            return EMPTY
        })
    }

    _buildMap() {
        this.waterPoints.forEach(point => this._detectWater(point))
    }

    _detectWater(startPoint) {
        let tileCount = 0
        const isFillable = point => this.getId(point) == EMPTY
        const onFill = point => {
            this._setPoint(point)
            tileCount++
        }

        if (isFillable(startPoint)) {
            new ScanlineFill8(this.grid, startPoint, onFill, isFillable).fill()
            // TODO: create new WaterRegion extends Region()
            this._buildWater(tileCount)
        }
    }

    _setPoint(point) {
        const id = this.currentID
        this.grid.set(point, id)
        this._detectShore(point, id)
    }

    _detectShore(point, id) {
        point.adjacentPoints(neighbor => {
            if (this.reliefMap.isLand(neighbor)) {
                this.grid.set(point, -id)
            }
        })
    }

    _buildWater(tileCount) {
        const id = this.currentID++
        const type = this._getWaterType(tileCount)
        this.waterMap[id] = new Water(id, type)
    }

    _getWaterType(tileCount) {
        const totalArea = Math.pow(this.size, 2)
        let type = POND
        for (let water of WATERBODY_MIN_AREA_TABLE) {
            let tilePercentage = (100 * tileCount) / totalArea
            if (tilePercentage >= water.percentage) {
                type = water.id
                break
            }
        }
        return type
    }

    isShore(point) {
        return this.grid.get(point) < 0
    }

    getId(point) {
        return this.grid.get(point)
    }

    getWater(id) {
        return this.waterMap[id]
    }
}


export class WaterbodyMap {
    constructor(size, reliefMap) {
        this.size      = size
        this.waterGrid = new WaterGrid(reliefMap)
    }

    get(point) {
        const id = this.waterGrid.getId(point)
        return this.waterGrid.getWater(id)
    }

    getColor(point) {
        const id = this.waterGrid.getId(point)
        return WATERBODY_TABLE[id].color
    }

    getName(point) {
        const id = this.waterGrid.getId(point)
        const water = this.get(point)
        const type_name = WATERBODY_TABLE[id].name
        return `${id}: ${water.name} ${type_name}`
    }
    isShore(point) { return this.isShore(point) }

    isOcean(point) { return this.get(point) == OCEAN }
    isSea(point) { return this.get(point) == SEA }
    isLake(point) { return this.get(point) == LAKE }
    isPond(point) { return this.get(point) == POND }
}


class Water {
    constructor(id, type) {
        this.id = id
        this.type = type
        this.name = Name.createWaterName()
    }
}
