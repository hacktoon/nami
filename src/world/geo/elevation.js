import _ from 'lodash'

import { Grid } from '../../lib/grid';
import { HeightMap } from '../../lib/heightmap'



const RIVER_ELEVATION = 5
const ELEVATION_TABLE = [
    { id: 0, height: 0,   color: "#000056", value: 0 },
    { id: 1, height: 80,  color: "#1a3792", value: 1 },
    { id: 2, height: 120, color: "#3379a6", value: 2 },
    { id: 3, height: 150, color: "#0a5816", value: 3 },
    { id: 4, height: 190, color: "#31771a", value: 4 },
    { id: 5, height: 240, color: "#6f942b", value: 5 },
    { id: 6, height: 254, color: "#BBBBBB", value: 6 },
    { id: 7, height: 257, color: "#EEEEEE", value: 7 }
]


class Elevation {
    constructor(id, baseHeight) {
        this.data = ELEVATION_TABLE[id]
        this.baseHeight = baseHeight
    }

    get id() { return this.data.id }
    get value () { return this.data.value }
    get color () { return this.data.color }
    get isBelowSeaLevel () { return this.data.value < 3 } // remove
    get isAboveSeaLevel() { return this.data.value >= 3 } // remove
    get isMiddle () {
        let middle = Math.floor(ELEVATION_TABLE.length / 2)
        return this.data.value == middle
    }

    raise (amount=1) {
        let newId = this.data.id + amount
        let id = _.clamp(newId, 0, ELEVATION_TABLE.length-1)
        this.data = ELEVATION_TABLE[id]
    }

    lower (amount=1) {
        let newId = this.data.id - amount
        let id = _.clamp(newId, 0, ELEVATION_TABLE.length-1)
        this.data = ELEVATION_TABLE[id]
    }

    level(newId) {
        let oldId = this.data.id
        let id = _.clamp(newId, 0, ELEVATION_TABLE.length - 1)
        if (oldId > id) {
            this.data = ELEVATION_TABLE[id]
        }
    }

    isLower (elevation) {
        return this.data.id < elevation.id
    }

    isHigher(elevation) {
        return this.data.id > elevation.id
    }

    get isLowest() {
        return this.data.id == _.first(ELEVATION_TABLE).id
    }

    get isHighest() {
        return this.data.id == _.last(ELEVATION_TABLE).id
    }

    get isRiverPossible() {
        return this.data.id == RIVER_ELEVATION
    }
}


export class ElevationMap {
    constructor(size, roughness) {
        this.grid = new Grid(size, size)
        this.gridMask = new HeightMap(size, roughness).grid

        new HeightMap(size, roughness, (point, height) => {
            let elevation = this.buildElevation(point, height)
            this.grid.set(point, elevation)
        })
    }

    get(point) {
        return this.grid.get(point)
    }

    buildElevation(point, height) {
        let id = this.getElevationId(height)
        let elevation = new Elevation(id, height)
        let maskElevation = this.buildMaskElevation(point)

        return this.filterElevation(elevation, maskElevation)
    }

    getElevationId(height) {
        let id = 0
        for (let elevationData of ELEVATION_TABLE) {
            if (height >= elevationData.height) {
                id = elevationData.id
            } else {
                break
            }
        }
        return id
    }

    buildMaskElevation(point) {
        let height = this.gridMask.get(point)
        let id = this.getElevationId(height)
        return new Elevation(id)
    }

    filterElevation(elevation, maskElevation) {
        if (maskElevation.isMiddle) {
            elevation.lower()
        }
        if (maskElevation.id > 5) {
            elevation.level(4)
        }
        if (maskElevation.id == 0) {
            elevation.level(5)
        }

        return elevation
    }
}
