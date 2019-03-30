import _ from 'lodash'

import { Grid } from '../../lib/grid';
import { HeightMap } from '../../lib/heightmap'


const RELIEF_TABLE = [
    { id: 0, height: 0,   color: "#000045", value: 0 },
    { id: 1, height: 5,   color: "#000056", value: 1 },
    { id: 2, height: 80,  color: "#1a3792", value: 2 },
    { id: 3, height: 120, color: "#3379a6", value: 3 },
    { id: 4, height: 150, color: "#0a5816", value: 4 },
    { id: 5, height: 190, color: "#31771a", value: 5 },
    { id: 6, height: 240, color: "#6f942b", value: 6 },
    { id: 7, height: 254, color: "#BBBBBB", value: 7 },
    { id: 8, height: 257, color: "#EEEEEE", value: 8 }
]


class Relief {
    constructor(id) {
        this.data = RELIEF_TABLE[id]
    }

    get id() { return this.data.id }
    get value () { return this.data.value }
    get color () { return this.data.color }
    get isBelowSeaLevel () { return this.data.value < 4 } // remove
    get isAboveSeaLevel() { return this.data.value >= 4 } // remove
    get isMiddle () {
        let middle = Math.floor(RELIEF_TABLE.length / 2)
        return this.data.value == middle
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

    isLower (relief) {
        return this.data.id < relief.id
    }

    isHigher(relief) {
        return this.data.id > relief.id
    }

    get isLowest() {
        return this.data.id == _.first(RELIEF_TABLE).id
    }

    get isHighest() {
        return this.data.id == _.last(RELIEF_TABLE).id
    }

    get isRiverPossible() {
        return this.data.id == 5
    }
}


export class ReliefMap {
    constructor(size, roughness) {
        this.grid = new Grid(size, size)
        this.gridMask = new HeightMap(size, roughness).grid

        new HeightMap(size, roughness, (point, height) => {
            let relief = this.buildRelief(point, height)
            this.grid.set(point, relief)
        })
    }

    get(point) {
        return this.grid.get(point)
    }

    buildRelief(point, height) {
        let id = this.getReliefId(height)
        let relief = new Relief(id)
        let maskRelief = this.buildMaskRelief(point)

        return this.filterRelief(relief, maskRelief)
    }

    getReliefId(height) {
        let id = 0
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
        if (maskRelief.isMiddle) {
            relief.lower()
        }
        if (maskRelief.id > 5) {
            relief.level(5)
        }
        if (maskRelief.id == 0) {
            relief.level(5)
        }

        return relief
    }
}
