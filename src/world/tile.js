

export default class Tile {
    constructor (point) {
        this.point = point
        this.type = Tile.OCEAN
        this.waterbody = undefined
        this.state = undefined
    }

    get isLand() { return Boolean(this.waterbody) }
    get isWater() { return this.isLand }

    static get OCEAN() { return 0 }
    static get LITORAL() { return 1 }
    static get CORAL() { return 2 }
    static get BEACH() { return 3 }
    static get RIVERSOURCE() { return 4 }
    static get RIVER() { return 5 }
    static get LAKE() { return 6 }
    static get MANGROVE() { return 7 }
    static get SWAMP() { return 8 }
    static get PLAIN() { return 9 }
    static get SHRUBLAND() { return 10 }
    static get SAVANNA() { return 11 }
    static get DESERT() { return 12 }
    static get FOREST() { return 13 }
    static get TAIGA() { return 14 }
    static get JUNGLE() { return 15 }
    static get TUNDRA() { return 16 }
    static get BOREAL() { return 17 }
    static get MOUNTAIN() { return 18 }
    static get PEAK() { return 19 }
    static get ICEBERG() { return 20 }
    static get ICECAP() { return 21 }
}


export const TILE_TABLE = [
    { id: Tile.OCEAN, color: "#000045", name: "Ocean" },
    { id: Tile.LITORAL, color: "#000056", name: "Litoral" },
    { id: Tile.CORAL, color: "", name: "Coral" },
    { id: Tile.BEACH, color: "", name: "Beach" },
    { id: Tile.RIVERSOURCE, color: "", name: "River source" },
    { id: Tile.RIVER, color: "", name: "River" },
    { id: Tile.LAKE, color: "#3379a6", name: "Lake" },
    { id: Tile.MANGROVE, color: "", name: "Mangrove" },
    { id: Tile.SWAMP, color: "", name: "Swamp" },
    { id: Tile.PLAIN, color: "", name: "Plain" },
    { id: Tile.SHRUBLAND, color: "", name: "Shrubland" },
    { id: Tile.SAVANNA, color: "", name: "Savanna" },
    { id: Tile.DESERT, color: "yellow", name: "Desert" },
    { id: Tile.FOREST, color: "", name: "Forest" },
    { id: Tile.TAIGA, color: "", name: "Taiga" },
    { id: Tile.JUNGLE, color: "", name: "Jungle" },
    { id: Tile.TUNDRA, color: "", name: "Tundra" },
    { id: Tile.BOREAL, color: "green", name: "Boreal forest" },
    { id: Tile.MOUNTAIN, color: "#DDDDDD", name: "Mountain" },
    { id: Tile.PEAK, color: "#EEEEEE", name: "Peak" },
    { id: Tile.ICEBERG, color: "blue", name: "Iceberg" },
    { id: Tile.ICECAP, color: "#FFFFFF", name: "Ice cap" },
]
