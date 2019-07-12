import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { MidpointDisplacement } from '../../lib/heightmap'
import { Point } from '../../lib/point'

const ARCTIC = 0
const SUBARCTIC = 1
const TEMPERATE = 2
const SUBTROPICAL = 3
const TROPICAL = 4

const ZONE_TABLE = [
    { id: 0, heatId: ARCTIC,        y: 10 },
    { id: 1, heatId: SUBARCTIC,     y: 15 },
    { id: 2, heatId: TEMPERATE,     y: 60 },
    { id: 3, heatId: SUBTROPICAL,   y: 96 },
    { id: 4, heatId: TROPICAL,      y: 160 },
    { id: 5, heatId: SUBTROPICAL,   y: 196 },
    { id: 6, heatId: TEMPERATE,     y: 216 },
    { id: 7, heatId: SUBARCTIC,     y: 241 },
    { id: 8, heatId: ARCTIC,        y: 256 }
]

const HEAT_TABLE = [
    { id: ARCTIC, value: 0, color: "white",  name: "Arctic" },
    { id: SUBARCTIC, value: 1, color: "gray",  name: "Subarctic" },
    { id: TEMPERATE, value: 2, color: "blue",   name: "Temperate" },
    { id: SUBTROPICAL, value: 3, color: "yellow", name: "Subtropical" },
    { id: TROPICAL, value: 4, color: "red",    name: "Tropical" }
]

const ROUGHNESS = .2


export class HeatMap {
    constructor(size, reliefMap) {
        this.grid = new Grid(size, size)
        this.reliefMap = reliefMap
        this._build(size)
    }

    _build(size) {
        const buildZone = zone => {
            let p1 = new Point(0, zone.y)
            let p2 = new Point(size - 1, zone.y)
            let setPoint = point => {
                if (zone.id == ZONE_TABLE.length - 1) {
                    point.y = zone.y
                }
                fillColumn(point, zone.heatId)
            }
            MidpointDisplacement(p1, p2, size, ROUGHNESS, setPoint)
        }

        const fillColumn = (point, id) => {
            let baseY = point.y

            while (baseY >= 0) {
                let pointAbove = new Point(point.x, baseY)

                if (this.grid.get(pointAbove) != undefined)
                    break
                let heat = this._filterHeat(new Heat(id), pointAbove)
                this.grid.set(pointAbove, heat)
                baseY--
            }
        }
        ZONE_TABLE.forEach(buildZone)
    }

    _filterHeat(heat, point) {
        const relief = this.reliefMap.get(point)
        if (relief.isPeak)     heat.lower(2)
        if (relief.isMountain) heat.lower()
        return heat
    }

    get(point) {
        return this.grid.get(point)
    }
}


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
        return HEAT_TABLE[ARCTIC]
    }

    get isArctic() {
        return this.data.id == ARCTIC
    }

    get isSubarctic() {
        return this.data.id == SUBARCTIC
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