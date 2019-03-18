import _ from 'lodash'


class ElevationMap {
    static get (id=null) {
        const _map = [
            { id: 0, height: 0,   color: "#000056", name: "-3", isBelowSeaLevel: true },
            { id: 1, height: 80,  color: "#1a3792", name: "-2", isBelowSeaLevel: true },
            { id: 2, height: 120, color: "#3379a6", name: "-1", isBelowSeaLevel: true },
            { id: 3, height: 150, color: "#0a5816", name: "0" },
            { id: 4, height: 190, color: "#31771a", name: "1" },
            { id: 5, height: 240, color: "#6f942b", name: "2" },
            { id: 6, height: 255, color: "#d5cab4", name: "3" }
        ]
        if (_.isNumber(id)) {
            let index = _.clamp(id, 0, _map.length-1)
            return _map[index]
        }
        return _map
    }

    static getHighest () {
        return _.last(ElevationMap.get())
    }

    static getLowest () {
        return _.first(ElevationMap.get())
    }
}


export default class Elevation {
    constructor (height) {
        const _map = ElevationMap.get()
        for(let elevationData of _map) {
            if (height >= elevationData.height) {
                this.elevation = elevationData
            } else {
                break
            }
        }
    }

    get id () { return this.elevation.id }
    get name () { return this.elevation.name }
    get height () { return this.elevation.height }
    get color () { return this.elevation.color }
    get isBelowSeaLevel () { return Boolean(this.elevation.isBelowSeaLevel) }
    get isAboveSeaLevel () { return !this.isBelowSeaLevel }

    raise (amount=1) {
        this.elevation = ElevationMap.get(this.elevation.id + amount)
    }

    lower (amount=1) {
        this.elevation = ElevationMap.get(this.elevation.id - amount)
    }

    isLower (elevation) {
        return this.elevation.id < elevation.id
    }

    isHigher (elevation) {
        return this.elevation.id > elevation.id
    }

    get isLowest () {
        return this.elevation.id === ElevationMap.getLowest().id
    }

    get isHighest () {
        return this.elevation.id === ElevationMap.getHighest().id
    }
}
