import Tile from '../tile'


const ABYSS = 0
const ICECAP = 1
const ICEBERG = 2
const OCEAN = 3
const SEA = 4
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
    { id: ABYSS, color: "#000034", name: "Abyss" },
    { id: ICECAP, color: "#87bfff", name: "Icecap" },
    { id: ICEBERG, color: "#EEE", name: "Iceberg" },
    { id: OCEAN, color: "#000045", name: "Ocean" },
    { id: SEA, color: "#000078", name: "Sea" },
    { id: CORAL, color: "#007587", name: "Coral" },
    { id: BEACH, color: "#adb734", name: "Beach" },
    { id: RIVER, color: "3379a6", name: "River" },
    { id: LAKE, color: "#3379a6", name: "Lake" },
    { id: MANGROVE, color: "#0a5816", name: "Mangrove" },
    { id: SWAMP, color: "#0a5816", name: "Swamp" },
    { id: GRASS, color: "#91c13a", name: "Grass" },
    { id: SAVANNA, color: "#d2ff4d", name: "Savanna" },
    { id: DESERT, color: "#ffec84", name: "Desert" },
    { id: FOREST, color: "#669900", name: "Forest" },
    { id: MOUNTAIN, color: "#afa182", name: "Mountain" },
    { id: PEAK, color: "#EEEEEE", name: "Peak" }
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
        return BIOME_TABLE[type]
    }

    getTileType(point) {
        let relief = this.reliefMap.get(point)
        let heat = this.heatMap.get(point)
        let moisture = this.moistureMap.get(point)
        let waterbody = this.waterbodyMap.get(point)

        if (heat.isArctic || heat.isSubarctic)
            moisture.lower(3)
        if (heat.isSubtropical)
            moisture.lower(1)
        if (heat.isTropical)
            moisture.raise(2)

        if (waterbody) {
            if (heat.isArctic && relief.isAbyss) {
                return ICECAP
            }
            if (waterbody.isLake) {
                return LAKE
            }
            if (waterbody.isSea) {
                return SEA
            }
            return OCEAN
        }
        if (heat.isArctic || heat.isSubarctic) {
            return GRASS
        }
        if (heat.isTemperate) {
            if (moisture.isHighest || moisture.isWet) {
                return FOREST
            }
            return GRASS
        }
        if (heat.isSubtropical) {
            if (moisture.isWet) {
                return SAVANNA
            }
            if (moisture.isDry) {
                return GRASS
            }
            if (moisture.isLowest) {
                return DESERT
            }
            return FOREST
        }
        if (heat.isTropical) {
            if (moisture.isHighest) {
                if (relief.isBasin || relief.isPlain) {
                    return FOREST
                }
            }
            if (relief.isPlain) {
                return FOREST
            }
            return GRASS
        }
    }
}



class Biome {
    constructor(type) {
        this.type = type
    }
}
