import _ from 'lodash'


const elevationTable = [
    { id: 0, height: 0,   color: "#000056", scale: -3 },
    { id: 1, height: 80,  color: "#1a3792", scale: -2 },
    { id: 2, height: 120, color: "#3379a6", scale: -1 },
    { id: 3, height: 150, color: "#0a5816", scale: 0 },
    { id: 4, height: 190, color: "#31771a", scale: 1 },
    { id: 5, height: 240, color: "#6f942b", scale: 2 },
    { id: 6, height: 255, color: "#d5cab4", scale: 3 }
]


export default class Elevation {
    constructor (height) {
        for(let elevationData of elevationTable) {
            if (height >= elevationData.height) {
                this.elevation = elevationData
            } else {
                break
            }
        }
    }

    get id () { return this.elevation.id }
    get height () { return this.elevation.height }
    get scale () { return this.elevation.scale }
    get color () { return this.elevation.color }
    get isBelowSeaLevel () { return this.elevation.scale < 0 }
    get isAboveSeaLevel () { return this.elevation.scale >= 0 }

    raise (amount=1) {
        let raisedIndex = this.elevation.id + amount
        let index = _.clamp(raisedIndex, 0, elevationTable.length-1)
        this.elevation = elevationTable[index]
    }

    lower (amount=1) {
        let loweredIndex = this.elevation.id - amount
        let index = _.clamp(loweredIndex, 0, elevationTable.length-1)
        this.elevation = elevationTable[index]
    }

    isLower (elevation) {
        return this.elevation.id < elevation.id
    }

    isHigher (elevation) {
        return this.elevation.id > elevation.id
    }

    get isLowest () {
        return this.elevation.id === _.first(elevationTable).id
    }

    get isHighest () {
        return this.elevation.id === _.last(elevationTable).id
    }
}
