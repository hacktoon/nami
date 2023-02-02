import { Color } from '/src/lib/color'


export const SPEC = [
    {id: 1, color: "#f2f2f2", name: "Ice plain" },
    {id: 2, color: "#b7c8c4", name: "Tundra" },
    {id: 3, color: "#008066", name: "Taiga" },
    {id: 4, color: "#00aa44", name: "Dark forest" },
    {id: 5, color: "#00aa44", name: "Woodlands" },
    {id: 6, color: "#338000", name: "Jungle" },
    {id: 7, color: "#cdde87", name: "Grasslands" },
    {id: 8, color: "#abc837", name: "Savanna" },
    {id: 9, color: "#ffeeaa", name: "Desert" },
    {id: 10, color: "#a3358c", name: "Swamp" },
    {id: 11, color: "#1d5674", name: "Trench" },
    {id: 12, color: "#216384", name: "Ocean" },
    {id: 13, color: "#2878a0", name: "Sea" },
    {id: 14, color: "#2878a0", name: "Lake" },
    {id: 15, color: "#5cffc4", name: "Reef" },
    {id: 16, color: "#000080", name: "Creek" },
    {id: 17, color: "#000080", name: "River" },
    {id: 18, color: "#876729", name: "Mangrove" },
]

const TYPE_MAP = new Map(SPEC.map(spec => [spec.id, spec]))


export class Biome {
    static fromId(id) {
        return new Biome(TYPE_MAP.get(id))
    }

    constructor(spec) {
        this.id = spec.id
        this.name = spec.name
        this.color = Color.fromHex(spec.color)
    }
}

SPEC.forEach(spec => {
    const name = spec.name.toUpperCase().replace(/\s+/, '_')
    const methodName = `is${spec.name}`
    Biome[name] = spec
    // add method for comparison
    Biome.prototype[methodName] = function() {
        return this.id === spec.id
    }
})
