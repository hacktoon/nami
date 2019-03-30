
const TYPE_TABLE = (function() {
    return [
        { color: "", name: "Ocean" },
        { color: "", name: "Coral" },
        { color: "", name: "River" },
        { color: "", name: "Lake" },
        { color: "", name: "Beach" },
        { color: "", name: "Tundra" },
        { color: "", name: "Taiga" },
        { color: "", name: "Grassland" },
        { color: "", name: "Forest" },
        { color: "", name: "Mangrove" },
        { color: "", name: "Jungle" },
        { color: "", name: "Shrubland" },
        { color: "", name: "Desert" }
    ].map((obj, i) => { obj.id = i; return obj })
})()
window.TYPE_TABLE = TYPE_TABLE

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

    }
}
