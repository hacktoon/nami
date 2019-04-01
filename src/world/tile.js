
const TYPE_TABLE = (function() {
    return [
        { color: "", name: "Ocean" },
        { color: "", name: "Litoral" },
        { color: "", name: "Coral" },
        { color: "", name: "Beach" },
        { color: "", name: "River source" },
        { color: "", name: "River" },
        { color: "", name: "Lake" },
        { color: "", name: "Mangrove" },
        { color: "", name: "Swamp" },
        { color: "", name: "Plain" },
        { color: "", name: "Shrubland" },
        { color: "", name: "Savanna" },
        { color: "", name: "Desert" },
        { color: "", name: "Forest" },
        { color: "", name: "Taiga" },
        { color: "", name: "Jungle" },
        { color: "", name: "Tundra" },
        { color: "green", name: "Boreal forest" },
        { color: "#DDDDDD", name: "Mountain" },
        { color: "#EEEEEE", name: "Peak" },
        { color: "blue", name: "Iceberg" },
        { color: "#FFFFFF", name: "Ice cap" },
    ].map((obj, i) => { obj.id = i; return obj })
})()
window.TYPE_TABLE = TYPE_TABLE


export default class Tile {
    constructor (point) {
        this.point = point
        this.type = undefined // Tile.default
        this.lake = ""
        this.sea = ""
        this.river = ""
        this.ocean = ""
        this.volcano = ""
        this.isLand = true
        this.isWater = false
        this.state = undefined
    }

    setRelief(relief) {
        this.relief = relief
    }

    setLake(lake) {
        this.lake = lake
    }
}


class TileMap {
    static get(id = null) {

    }
}
