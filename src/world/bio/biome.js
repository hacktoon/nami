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


export class BiomeMap {
    constructor(reliefMap, moistureMap, heatMap, waterbodyMap) {
        this.reliefMap = reliefMap
        this.heatMap = heatMap
        this.moistureMap = moistureMap
        this.waterbodyMap = waterbodyMap
    }

    get(point) {
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
