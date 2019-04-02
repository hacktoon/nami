

export default class Tile {
    constructor (point) {
        this.point = point
        this._type = Tile.OCEAN
        this.waterbody = undefined
        this.state = undefined
    }

    set type(id) {
        this._type = TILE_TABLE[id]
    }

    get type() {
        return this._type
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
    static get STEPPE() { return 14 }
    static get TAIGA() { return 15 }
    static get JUNGLE() { return 16 }
    static get MOUNTAIN() { return 17 }
    static get PEAK() { return 18 }
    static get TUNDRA() { return 19 }
    static get ICEBERG() { return 20 }
    static get ICECAP() { return 21 }
}


export const TILE_TABLE = [
    { id: Tile.OCEAN, color: "#000045", name: "Ocean" },
    { id: Tile.LITORAL, color: "#000078", name: "Litoral" },
    { id: Tile.CORAL, color: "", name: "Coral" },
    { id: Tile.BEACH, color: "", name: "Beach" },
    { id: Tile.RIVERSOURCE, color: "", name: "River source" },
    { id: Tile.RIVER, color: "", name: "River" },
    { id: Tile.LAKE, color: "#3379a6", name: "Lake" },
    { id: Tile.MANGROVE, color: "", name: "Mangrove" },
    { id: Tile.SWAMP, color: "", name: "Swamp" },
    { id: Tile.PLAIN, color: "#6f942b", name: "Plain" },
    { id: Tile.SHRUBLAND, color: "#e0cd3e", name: "Shrubland" },
    { id: Tile.SAVANNA, color: "#d2ff4d", name: "Savanna" },
    { id: Tile.DESERT, color: "#ffec84", name: "Desert" },
    { id: Tile.FOREST, color: "#669900", name: "Forest" },
    { id: Tile.STEPPE, color: "#2aaa3d", name: "Steppe" },
    { id: Tile.TAIGA, color: "#19633d", name: "Taiga" },
    { id: Tile.JUNGLE, color: "#336600", name: "Jungle" },
    { id: Tile.MOUNTAIN, color: "#afa182", name: "Mountain" },
    { id: Tile.PEAK, color: "#FFFFFF", name: "Peak" },
    { id: Tile.TUNDRA, color: "#EEEEEE", name: "Tundra" },
    { id: Tile.ICEBERG, color: "blue", name: "Iceberg" },
    { id: Tile.ICECAP, color: "#87bfff", name: "Ice" },
]
