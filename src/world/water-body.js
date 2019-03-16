import _ from 'lodash'


class WaterBodyMap {
    static get(id = null) {
        const _map = [
            { id: 0, temp: 0, y: 15, color: "white", name: "Polar" },
            { id: 1, temp: 1, y: 60, color: "blue", name: "Temperate" },
            { id: 2, temp: 2, y: 96, color: "yellow", name: "Subtropical" },
            { id: 3, temp: 3, y: 160, color: "red", name: "Tropical" },
            { id: 4, temp: 2, y: 196, color: "yellow", name: "Subtropical" },
            { id: 5, temp: 1, y: 241, color: "blue", name: "Temperate" },
            { id: 6, temp: 0, y: 256, color: "white", name: "Polar" }
        ]
        if (_.isNumber(id)) {
            let index = _.clamp(id, 0, _map.length - 1)
            return _map[index]
        }
        return _map
    }
}


export default class WaterBody {
    constructor(id) {
        this.waterBody = WaterBodyMap.get(id)
    }

    get id() { return this.waterBody.id }
    get name() { return this.waterBody.name }
    get color() { return this.waterBody.color }

}
