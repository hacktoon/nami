import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { HeightMap } from '../../lib/heightmap'
import { debug } from 'util';

const TRENCH = 0
const OCEAN = 1
const SEA = 2
const REEF = 3
const INNERSEA = 4
const BASIN = 5
const PLATFORM = 6
const HIGHLAND = 7
const MOUNTAIN = 8
const PEAK = 9

const RELIEF_TABLE = [
    { id: TRENCH, height: 0, color: "#000034", name: "Trench"},
    { id: OCEAN, height: 1, color: "#000045",  name: "Ocean"},
    { id: SEA, height: 120, color: "#000078", name: "Sea"},
    { id: REEF, height: 151, color: "#4444BC", name: "Reef"},
    { id: INNERSEA, height: 152, color: "#000078", name: "Sea" },
    { id: BASIN, height: 170, color: "#0a5816", name: "Basin" },
    { id: PLATFORM, height: 190, color: "#31771a", name: "Platform" },
    { id: HIGHLAND, height: 235, color: "#6f942b", name: "Highland" },
    { id: MOUNTAIN, height: 248,  color: "#AAAAAA", name: "Mountain" },
    { id: PEAK, height: 255,  color: "#EEEEEE", name: "Peak" }
]


export class ReliefMap {
    constructor(size, roughness) {
        this.size = size
        this.mask = new HeightMap(size, roughness)
        this.grid = new Grid(size, size)

        new HeightMap(size, roughness, (height, point) => {
            let relief = this.buildRelief(point, height)
            this.grid.set(point, relief)
        })
        ReliefFilter.smooth(this)
    }

    get(point) {
        return this.grid.get(point)
    }

    iter(callback) {
        this.grid.forEach(callback)
    }

    buildRelief(point, height) {
        let relief = new Relief(height)
        let maskRelief = this.getMaskRelief(point)

        return this.filterRelief(relief, maskRelief)
    }

    getMaskRelief(point) {
        let height = this.mask.get(point)
        return new Relief(height)
    }

    filterRelief(relief, maskRelief) {
        // remove mountains
        if (maskRelief.id > PLATFORM) {
            relief.level(HIGHLAND)
        }
        if (maskRelief.id == TRENCH) {
            relief.level(PLATFORM)
        }
        if (maskRelief.isMiddle) {
            relief.lower()
        }
        if (relief.isPeak && maskRelief.id > OCEAN) {
            relief.lower()
        }

        return relief
    }
}


class ReliefFilter {
    static smooth(map) {
        let grid = new Grid(map.size, map.size)
        map.iter((relief, refPoint) => {
            let sum = relief.id
            let valueCount = 1

            refPoint.pointsAround(point => {
                sum += map.get(point).id
                valueCount++
            })
            let id = Math.round(sum / valueCount)
            relief.level(id)
            grid.set(refPoint, relief)
        })
        map.grid = grid
    }

    static median(map) {
        let grid = new Grid(map.size, map.size)
        map.iter((relief, point) => {
            let values = [relief.id]
            point.pointsAround(pt => {
                values.push(map.get(pt).id)
            })
            values.sort((a, b) => a - b)
            let id
            if (values.length % 2 == 0) {
                let index = values.length / 2
                id = (values[index - 1] + values[index]) / 2
            } else {
                let index = Math.floor(values.length / 2)
                id = values[index]
            }
            relief.level(id)
            grid.set(point, relief)
        })
        map.grid = grid
    }
}


class HeightFilter {
    static smooth(map) {
        let grid = new Grid(map.size, map.size)
        map.iter((height, refPoint) => {
            let sum = height
            let valueCount = 1
            refPoint.pointsAround(point => {
                sum += map.get(point)
                valueCount++
            });
            grid.set(refPoint, Math.round(sum / valueCount))
        })
        map.grid = grid
    }

    static median(map) {
        let grid = new Grid(map.size, map.size)
        map.iter((height, point) => {
            let values = [map.get(point)]
            point.pointsAround(pt => {
                values.push(map.get(pt))
            })
            values.sort((a, b) => a - b)
            if (values.length % 2 == 0) {
                let index = values.length / 2
                grid.set(point, (values[index - 1] + values[index]) / 2)
            } else {
                let index = Math.floor(values.length / 2)
                grid.set(point, values[index])
            }
        })
        map.grid = grid
    }
}


class Relief {
    constructor(height) {
        let id = this._constructorId(height)
        this.height = height
        this.data = RELIEF_TABLE[id]
    }

    _constructorId(height) {
        let id = TRENCH
        for (let reliefData of RELIEF_TABLE) {
            if (height >= reliefData.height) {
                id = reliefData.id
            } else {
                break
            }
        }
        return id
    }

    get id() { return this.data.id }
    get color() { return this.data.color }
    get name() { return this.data.name }
    get isWater() { return this.data.id <= SEA }
    get isLand() { return !this.isWater }
    get isMiddle() {
        let middle = Math.floor(RELIEF_TABLE.length / 2)
        return this.data.id == middle
    }

    raise(amount = 1) {
        let newId = this.data.id + amount
        let id = _.clamp(newId, 0, RELIEF_TABLE.length - 1)
        this.data = RELIEF_TABLE[id]
    }

    lower(amount = 1) {
        let newId = this.data.id - amount
        let id = _.clamp(newId, 0, RELIEF_TABLE.length - 1)
        this.data = RELIEF_TABLE[id]
    }

    level(newId) {
        let oldId = this.data.id
        let id = _.clamp(newId, 0, RELIEF_TABLE.length - 1)
        if (oldId > id) {
            this.data = RELIEF_TABLE[id]
        }
    }

    get isTrench() { return this.data.id == TRENCH }
    get isOcean() { return this.data.id == OCEAN }
    get isReef() { return this.data.id == REEF }
    get isSea() { return this.data.id == INNERSEA || this.data.id == SEA }
    get isBasin() { return this.data.id == BASIN }
    get isPlatform() { return this.data.id == PLATFORM }
    get isHighland() { return this.data.id == HIGHLAND }
    get isMountain() { return this.data.id == MOUNTAIN }
    get isPeak() { return this.data.id == PEAK }

    get isRiverPossible() { return this.isHighland }
}
