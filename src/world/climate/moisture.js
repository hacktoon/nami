import _ from 'lodash'

import { Grid } from '../../lib/grid';
import { HeightMap } from '../../lib/heightmap'


const MOISTURE_TABLE = [
    { id: 0, height: 0,   color: "#19FFFF", name: "Very dry" },
    { id: 1, height: 30,  color: "#00D5FF", name: "Dry" },
    { id: 2, height: 90,  color: "#00ffbc", name: "Seasonal" },
    { id: 3, height: 150, color: "#00AAFF", name: "Wet" },
    { id: 4, height: 210, color: "#0080FF", name: "Very wet" }
]


export class MoistureMap {
    constructor(size, roughness, reliefMap) {
        this.grid = new Grid(size, size)
        this.reliefMap = reliefMap

        new HeightMap(size, roughness, (height, point) => {
            let moisture = this.buildMoisture(height)
            moisture = this._filterMoisture(moisture, point)
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

    _filterMoisture(moisture, point) {
        const relief = this.reliefMap.get(point)
        if (relief.isPeak)     moisture.lower(2)
        if (relief.isMountain) moisture.lower()
        if (relief.isBasin)    moisture.raise()
        return moisture
    }
}


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

    get isDry() {
        return this.data.id == 1
    }

    get isSeasonal() {
        return this.data.id == 2
    }

    get isWet() {
        return this.data.id == 3
    }

    get isHighest() {
        return this.data.id == _.last(MOISTURE_TABLE).id
    }
}
