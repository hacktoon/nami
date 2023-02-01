
export const BIOME_SPEC = [
    {id: 1, color: "#f2f2f2", name: "Ice plain" },
    {id: 2, color: "#b7c8c4", name: "Tundra" },
    {id: 3, color: "#008066", name: "Taiga" },
    {id: 4, color: "#00aa44", name: "Dark forest" },
    {id: 5, color: "#338000", name: "Jungle" },
    {id: 6, color: "#cdde87", name: "Grasslands" },
    {id: 7, color: "#abc837", name: "Savanna" },
    {id: 8, color: "#ffeeaa", name: "Desert" },
    {id: 9, color: "#a3358c", name: "Swamp" },
    {id: 10, color: "#000030", name: "Trench" },
    {id: 11, color: "#000080", name: "Ocean" },
    {id: 12, color: "#0033AA", name: "Sea" },
    {id: 13, color: "#1166d4", name: "Lake" },
    {id: 14, color: "#5cffc4", name: "Reef" },
    {id: 15, color: "#000080", name: "Creek" },
    {id: 16, color: "#000080", name: "River" },
    {id: 17, color: "#876729", name: "Mangrove" },
]


export class Biome {
    constructor(spec) {
        this.id = spec.id
        this.name = spec.name
        this.color = spec.color
    }
}

BIOME_SPEC.forEach(spec => {
    const name = spec.name.toUpperCase().replace(/\s+/, '_')
    const methodName = `is${spec.name}`
    Biome[name] = spec
    // add method for comparison
    Biome.prototype[methodName] = function() {
        return this.id === spec.id
    }
})
