
const TYPE_TABLE = (function() {
    return [
        { color: "", name: "Ocean" },
        { color: "", name: "Sea" },
        { color: "", name: "Beach" },
        { color: "", name: "Coral" },
        { color: "", name: "River source" },
        { color: "", name: "River" },
        { color: "", name: "Lake" },
        { color: "", name: "Swamp" },
        { color: "", name: "Mangrove" },
        { color: "", name: "Grassland" },
        { color: "", name: "Shrubland" },
        { color: "", name: "Desert" },
        { color: "", name: "Forest" },
        { color: "", name: "Jungle" },
        { color: "", name: "Tundra" },
        { color: "#FFFFFF", name: "Iceberg" },
        { color: "#FFFFFF", name: "Ice cap" },
    ].map((obj, i) => { obj.id = i; return obj })
})()
window.TYPE_TABLE = TYPE_TABLE


export default class Tile {
    constructor (point) {
        this.point = point
        this.type = undefined
        this.isLand = true
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
