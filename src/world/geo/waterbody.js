import _ from 'lodash'
import { ScanlineFill, Grid } from '../../lib/grid'
import { Name } from '../../lib/name'
import { getChance, Direction } from '../../lib/base';
import { PointNeighborhood, Point } from '../../lib/point';


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
        this.riverSources = []
    }

    get(point) {
        let id = this.grid.get(point)
        return this.idMap[id]
    }

    /* Detect oceans, seas and lakes */
    detectWaterBody(startPoint, neighbors) {
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

        if (isFillable(startPoint)) {
            new ScanlineFill(this.world.grid, startPoint, onFill, isFillable).fill()
            this._buildContainedWaterBody(this.nextId++, startPoint, tileCount)
            return
        }

        if (this._isRiverSource(startPoint, neighbors))
            this.riverSources.push(startPoint)
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

    buildRiver(point) {
        let id = this.nextId++
        let name = Name.createRiverName()
        let waterBody = new WaterBody(id, RIVER, name, point, 1)
        this.grid.set(point, id)
        this.idMap[id] = waterBody
        this._flowRiver(id, point)
    }

    _flowRiver(id, point) {
        let direction = Direction.randomCardinal()
        let points = [point]

        this.world.get(point).river = true
        let period = _.random(2, 20)
        while(true) {
            let x = point.x + 1
            let variance = Math.sin(x / period) + Math.sin(x * _.random(1, 10))
            let y = point.y + Math.round(variance)
            point = new Point(x, y)
            if (this.grid.get(point) != EMPTY_VALUE)
                break
            this.grid.set(point, id)
            this.world.get(point).river = true
        }
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
