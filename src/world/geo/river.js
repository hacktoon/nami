import _ from 'lodash'
import { Grid } from '../../lib/grid'
import { Name } from '../../lib/name'
import { getChance, Direction } from '../../lib/base';
import { PointNeighbors, Point } from '../../lib/point';


const RIVER_CHANCE = 0.15
const EMPTY_VALUE = 0


export class RiverMap {
    constructor(world, waterbodyMap) {
        this.world = world
        this.nextId = 1
        this.idMap = {}
        this.waterbodyMap = waterbodyMap
        this.sources = []
    }

    get(point) {
        let id = this.grid.get(point)
        return this.idMap[id]
    }

    static isRiverSource(point) {
        let tile = this.world.get(point)
        let isElevated = tile.elevation.isRiverPossible
        let isWetEnough = tile.moisture.isRiverPossible
        let isValid = RiverMap._isValidNeighborhood(point)
        let chance = getChance(RIVER_CHANCE)

        return chance && isElevated && isValid && isWetEnough
    }

    static _isValidNeighborhood(refPoint) {
        let neighbors = new PointNeighbors(refPoint)
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
        let meanderRate = _.random(5, 20)
        while(true) {
            point = this._getNextRiverPoint(point, meanderRate, direction)
            if (this.grid.get(point) != EMPTY_VALUE)
                break
            this.grid.set(point, id)
            this.world.get(point).river = true
        }
    }

    _getNextRiverPoint(point, meanderRate, direction) {
        let nextPoint = Point.at(point, direction)
        let x, y
        if (Direction.isHorizontal(direction)) {
            x = nextPoint.x
            let variance = this._getMeanderVariance(x, meanderRate)
            y = point.y + Math.round(variance)
        }
        if (Direction.isVertical(direction)) {
            y = nextPoint.y
            let variance = this._getMeanderVariance(y, meanderRate)
            x = point.x + Math.round(variance)
        }
        return new Point(x, y)
    }

    _getMeanderVariance(coordinate, rate) {
        return Math.sin(coordinate / rate)
               + Math.sin(coordinate * _.random(1, 10))
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
