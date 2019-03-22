import _ from 'lodash'

import {Grid} from '../../lib/grid'
import {MidpointDisplacement} from '../../lib/heightmap'
import {Point} from '../../lib/point'

const POLAR = 0
const TEMPERATE = 1
const SUBTROPICAL = 2
const TROPICAL = 3

const ZONE_TABLE = [
    { id: 0, heatId: POLAR,         y: 15 },
    { id: 1, heatId: TEMPERATE,     y: 60 },
    { id: 2, heatId: SUBTROPICAL,   y: 96 },
    { id: 3, heatId: TROPICAL,      y: 160 },
    { id: 4, heatId: SUBTROPICAL,   y: 196 },
    { id: 5, heatId: TEMPERATE,     y: 241 },
    { id: 6, heatId: POLAR,         y: 256 }
]

const HEAT_TABLE = [
    { id: POLAR, value: 0, color: "white",  name: "Polar" },
    { id: TEMPERATE, value: 1, color: "blue",   name: "Temperate" },
    { id: SUBTROPICAL, value: 2, color: "yellow", name: "Subtropical" },
    { id: TROPICAL, value: 3, color: "red",    name: "Tropical" }
]


class Heat {
    constructor(id) {
        this.data = HEAT_TABLE[id]
    }

    get id() { return this.data.id }
    get y() { return this.data.y }
    get name() { return this.data.name }
    get color() { return this.data.color }

    raise(amount = 1) {
        let raisedIndex = this.data.id + amount
        let id = _.clamp(raisedIndex, 0, HEAT_TABLE.length - 1)
        this.data = HEAT_TABLE[id]
    }

    lower(amount = 1) {
        let loweredIndex = this.data.id - amount
        let id = _.clamp(loweredIndex, 0, HEAT_TABLE.length - 1)
        this.data = HEAT_TABLE[id]
    }

    static getHottest() {
        return HEAT_TABLE[TROPICAL]
    }

    static getColdest() {
        return HEAT_TABLE[POLAR]
    }

    get isPolar() {
        return this.data.id == POLAR
    }

    get isTemperate() {
        return this.data.id == TEMPERATE
    }

    get isSubtropical() {
        return this.data.id == SUBTROPICAL
    }

    get isTropical() {
        return this.data.id == TROPICAL
    }
}


export class HeatMap {
    constructor(size, roughness) {
        this.grid = new Grid(size, size)
        this._build(size, roughness)
    }

    _build(size, roughness) {
        const buildZone = zone => {
            let p1 = new Point(0, zone.y)
            let p2 = new Point(size - 1, zone.y)
            let setPoint = point => {
                if (zone.id == ZONE_TABLE.length - 1) {
                    point.y = zone.y
                }
                fillColumn(point, zone.heatId)
            }
            MidpointDisplacement(p1, p2, size, roughness, setPoint)
        }

        const fillColumn = (point, id) => {
            let baseY = point.y

            while (baseY >= 0) {
                let pointAbove = new Point(point.x, baseY)

                if (this.grid.get(pointAbove) != undefined)
                    break
                this.grid.set(pointAbove, new Heat(id))
                baseY--
            }
        }
        ZONE_TABLE.forEach(buildZone)
    }

    get(point) {
        return this.grid.get(point)
    }
}
