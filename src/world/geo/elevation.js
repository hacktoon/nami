import _ from 'lodash'

import { Grid } from '../../lib/grid';
import { HeightMap } from '../../lib/heightmap'


const DEFAULT_ELEVATION = 0

const ELEVATION_TABLE = [
    { id: 0, height: 0,   color: "#000056", value: 0 },
    { id: 1, height: 80,  color: "#1a3792", value: 1 },
    { id: 2, height: 120, color: "#3379a6", value: 2 },
    { id: 3, height: 150, color: "#0a5816", value: 3 },
    { id: 4, height: 190, color: "#31771a", value: 4 },
    { id: 5, height: 240, color: "#6f942b", value: 5 },
    { id: 6, height: 255, color: "#d5cab4", value: 6 }
]


export class Elevation {
    constructor (height) {
        for(let elevationData of ELEVATION_TABLE) {
            if (height >= elevationData.height) {
                this.elevation = elevationData
            } else {
                break
            }
        }
    }

    get id () { return this.elevation.id }
    get height () { return this.elevation.height }
    get value () { return this.elevation.value }
    get color () { return this.elevation.color }
    get isBelowSeaLevel () { return this.elevation.value < 3 }
    get isAboveSeaLevel () { return this.elevation.value >= 3 }

    raise (amount=1) {
        let raisedIndex = this.elevation.id + amount
        let index = _.clamp(raisedIndex, 0, ELEVATION_TABLE.length-1)
        this.elevation = ELEVATION_TABLE[index]
    }

    lower (amount=1) {
        let loweredIndex = this.elevation.id - amount
        let index = _.clamp(loweredIndex, 0, ELEVATION_TABLE.length-1)
        this.elevation = ELEVATION_TABLE[index]
    }

    isLower (elevation) {
        return this.elevation.id < elevation.id
    }

    isHigher (elevation) {
        return this.elevation.id > elevation.id
    }

    get isLowest () {
        return this.elevation.id === _.first(ELEVATION_TABLE).id
    }

    get isHighest () {
        return this.elevation.id === _.last(ELEVATION_TABLE).id
    }
}


export class ElevationMap {
    constructor(size, roughness) {
        this.size = size
        this.roughness = roughness
        this.grid = new Grid(size, size, DEFAULT_ELEVATION)
        this.gridMask = new HeightMap(size, roughness).grid

        new HeightMap(this.size, this.roughness, (point, height) => {
            let elevation = this.buildElevation(height)
            this.grid.set(point, elevation)
        })
    }

    buildElevation(point, height) {
        let maskElevation = new Elevation(this.gridMask.get(point))

        this.getElevationByHeight(height)
        elevation = new Elevation()
        if (maskElevation.isAboveSeaLevel) {
            elevation.lower()
        }
    }

    getElevationByHeight(height) {
        let elevation = DEFAULT_ELEVATION
        for (let elevationData of ELEVATION_TABLE) {
            if (height >= elevationData.height) {
                elevation = elevationData.value
            } else {
                break
            }
        }
        return elevation
    }
}
