import { Random } from '/lib/random'

const VOLCANO_CHANCE = .007

const ICE = 0
const TUNDRA = 1
const BOREAL_FOREST = 2
const TEMPERATE_FOREST = 3
const WOODLANDS = 4
const GRASSLANDS = 5
const RAINFOREST = 6
const JUNGLE = 7
const SAVANNA = 8
const SHRUBLAND = 9
const DESERT = 10
const OCEAN = 11
const LAKE = 12
const CORAL_REEF = 13
const RIVER = 14
const MANGROVE = 15
const SWAMP = 16
const VOLCANO = 17


const BIOME_TABLE = [
    { id: ICE, color: "#f2f2f2", name: "Ice" },
    { id: TUNDRA, color: "#b7c8c4", name: "Tundra" },
    { id: BOREAL_FOREST, color: "#008066", name: "Boreal forest" },
    { id: TEMPERATE_FOREST, color: "#00aa44", name: "Temperate forest" },
    { id: WOODLANDS, color: "#71c837", name: "Woodlands" },
    { id: GRASSLANDS, color: "#cdde87", name: "Grasslands" },
    { id: RAINFOREST, color: "#338000", name: "Rainforest" },
    { id: JUNGLE, color: "#165016", name: "Jungle" },
    { id: SAVANNA, color: "#abc837", name: "Savanna" },
    { id: SHRUBLAND, color: "#d3bc5f", name: "Shrubland" },
    { id: DESERT, color: "#ffeeaa", name: "Desert" },
    { id: OCEAN, color: "#000080", name: "Ocean" },
    { id: LAKE, color: "#0055d4", name: "Lake" },
    { id: CORAL_REEF, color: "#5cffc4", name: "Coral reef" },
    { id: RIVER, color: "#000080", name: "River" },
    { id: MANGROVE, color: "#876729", name: "Mangrove" },
    { id: SWAMP, color: "#a3358c", name: "Swamp" },
    { id: VOLCANO, color: "#DD0000", name: "Volcano" }
]


export class BiomeMap {
    constructor(reliefMap, heatMap, moistureMap, waterMap) {
        this.reliefMap = reliefMap
        this.heatMap = heatMap
        this.moistureMap = moistureMap
        this.waterMap = waterMap
    }

    get(point) {
        let type = this._detectBiome(point)
        return BIOME_TABLE[type]
    }

    _detectBiome(point) {
        const relief = this.reliefMap.get(point)
        const heat = this.heatMap.get(point)
        const moisture = this.moistureMap.get(point)
        const water = this.waterMap.get(point)

        if (water) {
            const isWater = relief.isAbyss || relief.isShallow || relief.isBanks
            if (heat.isArctic && isWater) return ICE
            if (water.isSwamp) return SWAMP
            if (water.isLake || water.isSea || water.isPond) return LAKE
            if ((heat.isTropical || heat.isSubtropical) && relief.isBanks) {
                return CORAL_REEF
            }
            if (water.isRiver) return RIVER
            return OCEAN
        }

        if (relief.isMountain && Random.chance(VOLCANO_CHANCE)) {
            return VOLCANO
        }

        if (heat.isArctic) {
            if (moisture.isHighest || moisture.isWet) return ICE
            return TUNDRA
        }

        if (heat.isSubarctic) {
            if (moisture.isHighest || moisture.isWet) return BOREAL_FOREST
            return TUNDRA
        }

        if (heat.isTemperate) {
            if (moisture.isHighest || moisture.isWet) return TEMPERATE_FOREST
            if (moisture.isSeasonal) return WOODLANDS
            return GRASSLANDS
        }

        if (heat.isSubtropical) {
            if (relief.isRiverBank) return MANGROVE
            if (moisture.isHighest) return RAINFOREST
            if (moisture.isWet) return SAVANNA
            if (moisture.isSeasonal) return SHRUBLAND
            if (moisture.isDry) return SHRUBLAND
            if (moisture.isLowest) return DESERT
        }

        if (heat.isTropical) {
            if (relief.isRiverBank) return MANGROVE
            if (moisture.isHighest) return JUNGLE
            if (moisture.isWet) return RAINFOREST
            if (moisture.isSeasonal) return SAVANNA
            if (moisture.isDry) return SHRUBLAND
            if (moisture.isLowest) return DESERT
        }
    }
}
