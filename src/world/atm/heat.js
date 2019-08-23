import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { MidpointDisplacement } from '../../lib/heightmap'
import { Point } from '../../lib/point'

export const ARCTIC = 0
export const SUBARCTIC = 1
export const TEMPERATE = 2
export const SUBTROPICAL = 3
export const TROPICAL = 4

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
    { id: ARCTIC, value: 0, color: "#b5e4ff",  name: "Arctic" },
    { id: SUBARCTIC, value: 1, color: "#8bff60",  name: "Subarctic" },
    { id: TEMPERATE, value: 2, color: "#f7ff00",   name: "Temperate" },
    { id: SUBTROPICAL, value: 3, color: "#ffa100", name: "Subtropical" },
    { id: TROPICAL, value: 4, color: "#ff3503",    name: "Tropical" }
]

const ROUGHNESS = .2


export class HeatMap {
    constructor(size) {
        this.grid = new Grid(size, size)
        this.size = size
        this._buildMap()
    }

    _buildMap() {
        const buildZone = zone => {
            let p1 = new Point(0, zone.y)
            let p2 = new Point(this.size - 1, zone.y)
            let setPoint = point => {
                if (zone.id == _.last(ZONE_TABLE).id) {
                    point.y = zone.y
                }
                point.y = _.clamp(point.y, 0, this.size-1)
                fillColumn(point, zone.heatId)
            }
            MidpointDisplacement(p1, p2, ROUGHNESS, setPoint)
        }

        const fillColumn = (point, id) => {
            let baseY = point.y

            while (baseY >= 0) {
                let pointAbove = new Point(point.x, baseY)

                if (this.grid.get(pointAbove) != undefined)
                    break
                this.grid.set(pointAbove, id)
                baseY--
            }
        }
        ZONE_TABLE.forEach(buildZone)
    }

    isArctic(point) { return this.get(point) == ARCTIC }

    isSubarctic(point) { return this.get(point) == SUBARCTIC }

    isTemperate(point) { return this.get(point) == TEMPERATE }

    isSubtropical(point) { return this.get(point) == SUBTROPICAL }

    isTropical(point) { return this.get(point) == TROPICAL }

    get(point) {
        return this.grid.get(point)
    }

    getName(point) {
        const id = this.get(point)
        return HEAT_TABLE[id].name
    }

    getColor(point) {
        const id = this.get(point)
        return HEAT_TABLE[id].color
    }
}
