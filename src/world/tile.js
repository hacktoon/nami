export default class Tile {
    constructor (point) {
        this.point = point
        this.type = undefined
        this.isAboveSeaLevel = true
        this.isWater = false
        this.isRiverSource = false
        this.isVolcano = false
        this.lastState = undefined
    }
}


class TileMap {
    static get(id = null) {
        const _map = [
            { id: 0, color: "", name: "Ocean" },
            { id: 1, color: "", name: "Coral" },
            { id: 2, color: "", name: "River" },
            { id: 3, color: "", name: "Lake" },
            { id: 4, color: "", name: "Beach" },
            { id: 5, color: "", name: "Tundra" },
            { id: 6, color: "", name: "Taiga" },
            { id: 7, color: "", name: "Grassland" },
            { id: 8, color: "", name: "Forest" },
            { id: 9, color: "", name: "Mangrove" },
            { id: 10, color: "", name: "Jungle" },
            { id: 11, color: "", name: "Shrubland" },
            { id: 12, color: "", name: "Desert" }
        ]
        if (_.isNumber(id)) {
            let index = _.clamp(id, 0, _map.length - 1)
            return _map[index]
        }
        return _map
    }
}
