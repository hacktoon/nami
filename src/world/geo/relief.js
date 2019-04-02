import _ from 'lodash'

import { Grid } from '../../lib/grid';
import { HeightMap } from '../../lib/heightmap'


const RELIEF_TABLE = (function () {
    return [
        { height: 0, color: "#144463", name: "Trench", isWater: true },
        { height: 1, color: "#174e71",  name: "Deep", isWater: true },
        { height: 120,  color: "#3379a6", name: "Shallow", isWater: true },
        { height: 170, color: "#6f942b", name: "Basin" },
        { height: 190,  color: "#31771a", name: "Platform" },
        { height: 235, color: "#346314", name: "Highland" },
        { height: 254,  color: "#AAAAAA", name: "Mountain" },
        { height: 257,  color: "#EEEEEE", name: "Peak" }
    ].map((obj, i) => { obj.id = i; return obj })
})()


class Relief {
    constructor(id) {
        this.data = RELIEF_TABLE[id]
    }

    get id() { return this.data.id }
    get color () { return this.data.color }
    get name () { return this.data.name }
    get isWater () { return this.data.isWater }
    get isLand() { return ! this.data.isWater }
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

    get isShallow() {
        return this.data.id == 2
    }

    get isBasin() {
        return this.data.id == 3
    }

    get isPlatform() {
        return this.data.id == 4
    }

    get isHighland() {
        return this.data.id == 5
    }

    get isMountain() {
        return this.data.id == 6
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

    get size() {
        return this.grid.width
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
        // remove mountains
        if (maskRelief.id > 4) {
            relief.level(5)
        }
        if (maskRelief.id == 0) {
            relief.level(4)
        }
        if (maskRelief.isMiddle) {
            relief.lower()
        }
        if (relief.isHighest && maskRelief.id > 1) {
            relief.lower()
        }

        return relief
    }
}
