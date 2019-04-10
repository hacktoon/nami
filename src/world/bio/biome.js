import Tile from '../tile'


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


const BIOME_TABLE = [
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



const TILE_TABLE = [
    { id: Tile.OCEAN, color: "#000045", name: "Ocean" },
    { id: Tile.LITORAL, color: "#000078", name: "Litoral" },
    { id: Tile.CORAL, color: "", name: "Coral" },
    { id: Tile.BEACH, color: "", name: "Beach" },
    { id: Tile.RIVERSOURCE, color: "", name: "River source" },
    { id: Tile.RIVER, color: "", name: "River" },
    { id: Tile.LAKE, color: "#3379a6", name: "Lake" },
    { id: Tile.MANGROVE, color: "", name: "Mangrove" },
    { id: Tile.SWAMP, color: "", name: "Swamp" },
    { id: Tile.PLAIN, color: "#91c13a", name: "Plain" },
    { id: Tile.SHRUBLAND, color: "#e0cd3e", name: "Shrubland" },
    { id: Tile.SAVANNA, color: "#d2ff4d", name: "Savanna" },
    { id: Tile.DESERT, color: "#ffec84", name: "Desert" },
    { id: Tile.FOREST, color: "#669900", name: "Forest" },
    { id: Tile.STEPPE, color: "#2aaa3d", name: "Steppe" },
    { id: Tile.TAIGA, color: "#19633d", name: "Taiga" },
    { id: Tile.JUNGLE, color: "#336600", name: "Jungle" },
    { id: Tile.MOUNTAIN, color: "#afa182", name: "Mountain" },
    { id: Tile.PEAK, color: "#FFF", name: "Peak" },
    { id: Tile.TUNDRA, color: "#E6E6E6", name: "Tundra" },
    { id: Tile.ICEBERG, color: "blue", name: "Iceberg" },
    { id: Tile.ICECAP, color: "#87bfff", name: "Ice" },
]



export class BiomeMap {
    constructor(reliefMap, heatMap, moistureMap, waterbodyMap) {
        this.reliefMap = reliefMap
        this.heatMap = heatMap
        this.moistureMap = moistureMap
        this.waterbodyMap = waterbodyMap
    }

    get(point) {
        let type = this.getTileType(point)
        return TILE_TABLE[type]
    }

    getTileType(point) {
        let relief = this.reliefMap.get(point)
        let heat = this.heatMap.get(point)
        let moisture = this.moistureMap.get(point)
        let waterbody = this.waterbodyMap.get(point)

        if (heat.isPolar)
            moisture.lower(3)
        if (heat.isSubtropical)
            moisture.lower(1)
        if (heat.isTropical)
            moisture.raise(2)

        if (relief.isWater) {
            if (heat.isPolar && relief.isAbyss) {
                return Tile.ICECAP
            }
            if (relief.isShallow) {
                return Tile.LITORAL
            }
            return Tile.OCEAN
        }
        if (heat.isPolar) {
            return Tile.TUNDRA
        }
        if (heat.isTemperate) {
            if (moisture.isHighest || moisture.isWet) {
                return Tile.TAIGA
            }
            return Tile.STEPPE
        }
        if (heat.isSubtropical) {
            if (moisture.isWet) {
                return Tile.SAVANNA
            }
            if (moisture.isDry) {
                return Tile.SHRUBLAND
            }
            if (moisture.isLowest) {
                return Tile.DESERT
            }
            return Tile.FOREST
        }
        if (heat.isTropical) {
            if (moisture.isHighest) {
                if (relief.isBasin || relief.isPlain) {
                    return Tile.JUNGLE
                }
            }
            if (relief.isPlain) {
                return Tile.FOREST
            }
            return Tile.PLAIN
        }
    }
}



class Biome {
    constructor(type) {
        this.type = type
    }
}
