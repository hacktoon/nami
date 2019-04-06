
const TRENCH = 0
const ICECAP = 1
const ICEBERG = 2
const OCEAN = 3
const BANK = 4
const CORAL = 5
const BEACH = 6
const RIVER = 7
const LAKE = 8
const MANGROVE = 9
const SWAMP = 10
const GRASS = 11
const SAVANNA = 12
const DESERT = 13
const FOREST = 14
const MOUNTAIN = 15
const PEAK = 16


const TILE_TABLE = [
    { id: TRENCH, color: "#000034", name: "Trench" },
    { id: ICECAP, color: "#87bfff", name: "Icecap" },
    { id: ICEBERG, color: "#EEE", name: "Iceberg" },
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
    { id: PEAK, color: "#FFF", name: "Peak" }
]

class BiomeMap {

}



class Biome {
    constructor(type) {
        this.type = type
    }
}
