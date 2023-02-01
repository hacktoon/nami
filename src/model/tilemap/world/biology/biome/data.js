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


export const BIOME_SPEC = [
    {name: 'Ice', color: "#f2f2f2", name: "Ice" },
    {name: 'Tundra', color: "#b7c8c4", name: "Tundra" },
    {name: 'BorealForest', color: "#008066", name: "Boreal forest" },
    {name: 'TemperateForest', color: "#00aa44", name: "Temperate forest" },
    {name: 'Rainforest', color: "#338000", name: "Rainforest" },
    {name: 'Grasslands', color: "#cdde87", name: "Grasslands" },
    {name: 'Savanna', color: "#abc837", name: "Savanna" },
    {name: 'Shrubland', color: "#d3bc5f", name: "Shrubland" },
    {name: 'Desert', color: "#ffeeaa", name: "Desert" },
    {name: 'Swamp', color: "#a3358c", name: "Swamp" },
    {name: 'Ocean', color: "#000080", name: "Ocean" },
    {name: 'Lake', color: "#0055d4", name: "Lake" },
    {name: 'Reef', color: "#5cffc4", name: "Coral reef" },
    {name: 'River', color: "#000080", name: "River" },
    {name: 'Mangrove', color: "#876729", name: "Mangrove" },''
]


export const BIOME_MAP = new Map(BIOME_SPEC.map(spec => [spec.name, spec]))


export class Biome {
    // static fromId(id) {
    //     return BIOME_MAP.get(id)
    // }
}

BIOME_SPEC.forEach(spec => {
    // const name = spec.name.toUpperCase()
    // Biome[name] = spec
})
