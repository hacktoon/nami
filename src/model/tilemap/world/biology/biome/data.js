import { Color } from '/src/lib/color'


export const SPEC = [
    {id: 1,  color: "#f2f2f2", name: "Icecap"},
    {id: 2,  color: "#afe7da", name: "Tundra"},
    {id: 3,  color: "#56c472", name: "Taiga"},
    {id: 4,  color: "#57aa13", name: "Woodlands"},
    {id: 5,  color: "#4b8b17", name: "Jungle"},
    {id: 6,  color: "#8abb63", name: "Grasslands"},
    {id: 7,  color: "#b5c23f", name: "Savanna"},
    {id: 8,  color: "#d1c69c", name: "Desert"},
    {id: 9,  color: "#1d5674", name: "Trench"},
    {id: 10, color: "#216384", name: "Ocean"},
    {id: 11, color: "#2878a0", name: "Sea"},
    {id: 12, color: "#8ea2ce", name: "Reef"},
    {id: 13, color: "#437718", name: "Mangrove"},
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

    is(type) {
        return this.id === type.id
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
