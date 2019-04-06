
const TRENCH = 0
const OCEAN = 0
const BANK = 1
const CORAL = 2
const BEACH = 3
const RIVER = 4
const LAKE = 5
const MANGROVE = 6
const SWAMP = 7
const GRASS = 8
const SAVANNA = 9
const DESERT = 10
const FOREST = 11
const MOUNTAIN = 12
const PEAK = 13
const ICECAP = 14
const ICEBERG = 15


const TILE_TABLE = [
    { id: TRENCH, color: "#000034", name: "Trench" },
    { id: OCEAN, color: "#000045", name: "Ocean" },
    { id: BANK, color: "#000078", name: "Bank" },
    { id: CORAL, color: "", name: "Coral" },
    { id: BEACH, color: "", name: "Beach" },
    { id: RIVER, color: "", name: "River" },
    { id: LAKE, color: "#3379a6", name: "Lake" },
    { id: MANGROVE, color: "", name: "Mangrove" },
    { id: SWAMP, color: "", name: "Swamp" },
    { id: GRASS, color: "#91c13a", name: "Grass" },
    { id: SAVANNA, color: "#d2ff4d", name: "Savanna" },
    { id: DESERT, color: "#ffec84", name: "Desert" },
    { id: FOREST, color: "#669900", name: "Forest" },
    { id: MOUNTAIN, color: "#afa182", name: "Mountain" },
    { id: PEAK, color: "#FFF", name: "Peak" },
    { id: ICECAP, color: "#87bfff", name: "Icecap" },
    { id: ICEBERG, color: "#EEE", name: "Iceberg" },
]

class BiomeMap {

}



class Biome {
    constructor(type) {
        this.type = type
    }
}
