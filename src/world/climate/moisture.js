import _ from 'lodash'

import { Grid } from '../../lib/grid';
import { HeightMap } from '../../lib/heightmap'


const MIN_RIVER_POSSIBLE = 2
const MOISTURE_TABLE = [
    { id: 0, height: 0, color: "#19FFFF", name: "Very dry" },
    { id: 1, height: 30, color: "#00D5FF", name: "Dry" },
    { id: 2, height: 90, color: "#00AAFF", name: "Wet" },
    { id: 3, height: 210, color: "#0080FF", name: "Very wet" }
]


class Moisture {
    constructor(id) {
        this.data = MOISTURE_TABLE[id]
    }

    get id () { return this.data.id }
    get name () { return this.data.name }
    get color () { return this.data.color }

    raise(amount = 1) {
        let raisedIndex = this.data.id + amount
        let id = _.clamp(raisedIndex, 0, MOISTURE_TABLE.length - 1)
        this.data = MOISTURE_TABLE[id]
    }

    lower(amount = 1) {
        let loweredIndex = this.data.id - amount
        let id = _.clamp(loweredIndex, 0, MOISTURE_TABLE.length - 1)
        this.data = MOISTURE_TABLE[id]
    }

    isLower (moisture) {
        return this.data.id < moisture.id
    }

    isHigher (moisture) {
        return this.data.id > moisture.id
    }

    get isLowest() {
        return this.data.id == _.first(MOISTURE_TABLE).id
    }

    get isHighest() {
        return this.data.id == _.last(MOISTURE_TABLE).id
    }

    get isRiverPossible() {
        return this.data.id >= MIN_RIVER_POSSIBLE
    }
}


export class MoistureMap {
    constructor(size, roughness) {
        this.grid = new Grid(size, size)

        new HeightMap(size, roughness, (point, height) => {
            let moisture = this.buildMoisture(height)
            this.grid.set(point, moisture)
        })
    }

    get(point) {
        return this.grid.get(point)
    }

    buildMoisture(height) {
        let id
        for (let reference of MOISTURE_TABLE) {
            if (height >= reference.height) {
                id = reference.id
            } else {
                break
            }
        }
        return new Moisture(id)
    }
}
