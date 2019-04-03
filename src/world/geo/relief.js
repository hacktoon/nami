import _ from 'lodash'

import { Grid } from '../../lib/grid';
import { HeightMap } from '../../lib/heightmap'

const TRENCH = 0
const DEEP = 1
const SHALLOW = 2
const BASIN = 3
const PLATFORM = 4
const HIGHLAND = 5
const MOUNTAIN = 6
const PEAK = 7

const RELIEF_TABLE = [
    { id: TRENCH, height: 0, color: "#1a3792", name: "Trench"},
    { id: DEEP, height: 1, color: "#1a3792",  name: "Deep"},
    { id: SHALLOW, height: 120, color: "#3379a6", name: "Shallow"},
    { id: BASIN, height: 170, color: "#0a5816", name: "Basin" },
    { id: PLATFORM, height: 190, color: "#31771a", name: "Platform" },
    { id: HIGHLAND, height: 235, color: "#6f942b", name: "Highland" },
    { id: MOUNTAIN, height: 254,  color: "#AAAAAA", name: "Mountain" },
    { id: PEAK, height: 257,  color: "#EEEEEE", name: "Peak" }
]


class Relief {
    constructor(id) {
        this.data = RELIEF_TABLE[id]
    }

    get id() { return this.data.id }
    get color () { return this.data.color }
    get name () { return this.data.name }
    get isWater () { return this.data.id <= SHALLOW }
    get isLand() { return ! this.isWater }
    get isMiddle () {
        let middle = Math.floor(RELIEF_TABLE.length / 2)
        return this.data.id == middle
    }

    raise (amount=1) {
        let newId = this.data.id + amount
        let id = _.clamp(newId, 0, RELIEF_TABLE.length-1)
        this.data = RELIEF_TABLE[id]
    }

    lower (amount=1) {
        let newId = this.data.id - amount
        let id = _.clamp(newId, 0, RELIEF_TABLE.length-1)
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
    get isDeep() { return this.data.id == DEEP }
    get isShallow() { return this.data.id == SHALLOW }
    get isBasin() { return this.data.id == BASIN }
    get isPlatform() { return this.data.id == PLATFORM }
    get isHighland() { return this.data.id == HIGHLAND }
    get isMountain() { return this.data.id == MOUNTAIN }
    get isPeak() { return this.data.id == PEAK }

    get isRiverPossible() { return this.isHighland }
}


export class ReliefMap {
    constructor(size, roughness) {
        this.grid = new Grid(size, size)
        this.gridMask = new HeightMap(size, roughness)

        new HeightMap(size, roughness, (point, height) => {
            let relief = this.buildRelief(point, height)
            this.grid.set(point, relief)
        })

        // heightMap.grid.forEach((height, point) => {
        //     let relief = this.buildRelief(point, height)
        //     //height = HeightFilter.median(heightMap.grid, point)
        //     //height = _.clamp(height, 0, size-1)
        //     this.grid.set(point, relief)
        // })
    }

    get(point) {
        return this.grid.get(point)
    }

    iter(callback) {
        this.grid.forEach(callback)
    }

    buildRelief(point, height) {
        let id = this.getReliefId(height)
        let relief = new Relief(id)
        let maskRelief = this.buildMaskRelief(point)

        return this.filterRelief(relief, maskRelief)
    }

    getReliefId(height) {
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

    buildMaskRelief(point) {
        let height = this.gridMask.get(point)
        let id = this.getReliefId(height)
        return new Relief(id)
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
        if (relief.isPeak && maskRelief.id > DEEP) {
            relief.lower()
        }

        return relief
    }
}


class HeightFilter {
    static smooth(grid, refPoint) {
        let sum = grid.get(refPoint)
        let valueCount = 1
        refPoint.adjacentPoints(point => {
            sum += grid.get(point)
            valueCount++
        });
        return Math.round(sum / valueCount)
    }

    static filter(point, adjacentPoints) {

    }

    static median(grid, refPoint) {
        let values = [grid.get(refPoint)]
        refPoint.adjacentPoints(point => {
            values.push(grid.get(point))
        })
        values.sort((a, b) => a-b)
        if (values.length % 2 == 0) {
            let index = values.length / 2
            return (values[index-1] + values[index]) / 2
        } else {
            let index = Math.floor(values.length / 2)
            return values[index]
        }
    }
}
