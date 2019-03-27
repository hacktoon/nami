import { ScanlineFill, Grid } from '../../lib/grid'
import { Name } from '../../lib/name'
import { getChance, Direction } from '../../lib/base';
import { PointNeighborhood } from '../../lib/point';


const RIVER_CHANCE = 0.15
const EMPTY_VALUE = 0
const OCEAN = 0
const SEA = 1
const LAKE = 2
const RIVER = 2


export class WaterBodyMap {
    constructor(world) {
        this.world = world
        this.nextId = 1
        this.grid = new Grid(world.size, world.size, EMPTY_VALUE)
        this.idMap = {}
        this.minOceanArea = world.area / 10
        this.minSeaArea = world.area / 50
    }

    get(point) {
        let id = this.grid.get(point)
        return this.idMap[id]
    }

    detect(point, neighbors) {
        let tile = this.world.get(point)
        if (tile.elevation.isBelowSeaLevel) {
            this._detectContainedWaterBody(point)
        } else {
            this._detectRiver(point, neighbors)
        }
    }

    /* Detect oceans, seas and lakes */
    _detectContainedWaterBody(startPoint) {
        let tileCount = 0
        const isFillable = point => {
            let tile = this.world.get(point)
            let isEmpty = this.grid.get(point) == EMPTY_VALUE
            return tile.elevation.isBelowSeaLevel && isEmpty
        }
        const onFill = point => {
            this.grid.set(point, this.nextId)
            tileCount++
        }

        if (!isFillable(startPoint)) return
        new ScanlineFill(this.world.grid, startPoint, onFill, isFillable).fill()
        this._buildContainedWaterBody(this.nextId++, startPoint, tileCount)
    }

    _buildContainedWaterBody(id, point, tileCount) {
        if (tileCount == 0) return

        let name = Name.createWaterBodyName()
        let type = LAKE

        if (this._isOceanType(tileCount)) {
            type = OCEAN
        } else if (this._isSeaType(tileCount)) {
            type = SEA
        }
        let waterBody = new WaterBody(id, type, name, point, tileCount)
        this.idMap[id] = waterBody
    }

    _isOceanType(tileCount) {
        return tileCount >= this.minOceanArea
    }

    _isSeaType(tileCount) {
        return !this._isOceanType(tileCount) && tileCount >= this.minSeaArea
    }

    _detectRiver(point, neighbors) {
        if (! this._isRiverSource(point, neighbors))
            return

        let id = this.nextId++
        let name = Name.createRiverName()
        let waterBody = new WaterBody(id, RIVER, name, point, 1)
        this.grid.set(point, id)
        this.idMap[id] = waterBody
        this._flowRiver(id, point)
    }

    _isRiverSource(point, neighbors) {
        let tile = this.world.get(point)
        let isElevated = tile.elevation.isRiverPossible
        let isWetEnough = tile.moisture.isRiverPossible
        let isValid = this._isValidRiverSource(neighbors)
        let chance = getChance(RIVER_CHANCE)

        return chance && isElevated && isValid && isWetEnough
    }

    _isValidRiverSource(neighbors) {
        let mountains = 0
        let isolated = true
        neighbors.adjacent(point => {
            let tile = this.world.get(point)
            if (this.grid.get(point) != EMPTY_VALUE) {
                isolated = false
            }
            if (tile.elevation.isHighest) {
                mountains++
            }
        })
        return isolated && (mountains == 2 || mountains == 3)
    }

    _flowRiver(id, point) {
        let dir = Direction.randomCardinal()
        let points = [point]

        // while(true) {

        // }
    }
}


class WaterBody {
    constructor(id, type, name, point, area) {
        this.id = id
        this.type = type
        this.name = name
        this.point = point
        this.area = area
    }

    get isOcean() { return this.type == OCEAN }
    get isSea() { return this.type == SEA }
    get isLake() { return this.type == LAKE }
    get isRiver() { return this.type == RIVER }
    // get isStream() { return this.type == STREAM }
}
