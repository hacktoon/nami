import _ from 'lodash'

import { Grid } from '../../lib/grid';
import { HeightMap } from '../../lib/heightmap'


const RAIN_TABLE = [
    { id: 0, height: 0, color: "#19FFFF", name: "Very dry" },
    { id: 1, height: 30, color: "#00D5FF", name: "Dry" },
    { id: 2, height: 90, color: "#00AAFF", name: "Wet" },
    { id: 3, height: 210, color: "#0080FF", name: "Very wet" }
]


class Rain {
    constructor(id) {
        this.data = RAIN_TABLE[id]
    }

    get id () { return this.data.id }
    get name () { return this.data.name }
    get color () { return this.data.color }

    raise(amount = 1) {
        let raisedIndex = this.data.id + amount
        let id = _.clamp(raisedIndex, 0, RAIN_TABLE.length - 1)
        this.data = RAIN_TABLE[id]
    }

    lower(amount = 1) {
        let loweredIndex = this.data.id - amount
        let id = _.clamp(loweredIndex, 0, RAIN_TABLE.length - 1)
        this.data = RAIN_TABLE[id]
    }

    isLower (rain) {
        return this.data.id < rain.id
    }

    isHigher (rain) {
        return this.data.id > rain.id
    }

    isLowest () {
        return this.data.id == _.first(RAIN_TABLE).id
    }

    isHighest () {
        return this.data.id == _.last(RAIN_TABLE).id
    }
}


export class RainMap {
    constructor(size, roughness) {
        this.grid = new Grid(size, size)

        new HeightMap(size, roughness, (point, height) => {
            let rain = this.buildRain(height)
            this.grid.set(point, rain)
        })
    }

    get(point) {
        return this.grid.get(point)
    }

    buildRain(height) {
        let id
        for (let reference of RAIN_TABLE) {
            if (height >= reference.height) {
                id = reference.id
            } else {
                break
            }
        }
        return new Rain(id)
    }
}
