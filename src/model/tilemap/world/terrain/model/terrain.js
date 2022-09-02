import { Color } from '/src/lib/color'


const TERRAIN_SPEC = [
    {
        id: 0,
        name: 'Abyss',
        water: true,
        color: Color.fromHex('#1d5674'),
        erosible: false,
    },
    {
        id: 1,
        name: 'Ocean',
        water: true,
        color: Color.fromHex('#216384'),
        erosible: false,
    },
    {
        id: 2,
        name: 'Sea',
        water: true,
        color: Color.fromHex('#2878a0'),
        erosible: false,
    },
    {
        id: 3,
        name: 'Basin',
        water: false,
        color: Color.fromHex('#71b13e'),
        erosible: true,
    },
    {
        id: 4,
        name: 'Plain',
        water: false,
        color: Color.fromHex('#99d966'),
        erosible: true,
    },
    {
        id: 5,
        name: 'Plateau',
        water: false,
        color: Color.fromHex('#b6e491'),
        erosible: true,
    },
    {
        id: 6,
        name: 'Mountain',
        water: false,
        color: Color.fromHex('#c0b896'),
        erosible: true,
    },
    {
        id: 7,
        name: 'Peak',
        water: false,
        color: Color.fromHex('#DDD'),
        erosible: true,
    }
]


export class Terrain {
    constructor(spec) {
        this.id = spec.id
        this.name = spec.name
        this.water = spec.water
        this.color = spec.color
    }
}


export class TerrainTypeMap {
    #map

    static nameReference = Object.fromEntries(TERRAIN_SPEC.map(spec => {
        return [spec.name.toUpperCase(), spec.id]
    }))

    static get types() {
        return TerrainTypeMap.nameReference
    }

    constructor() {
        this.#map = new Map(TERRAIN_SPEC.map(spec => {
            return [spec.id, new Terrain(spec)]
        }))
    }

    get(id) {
        return this.#map.get(id)
    }

    forEach(callback) {
        for(let terrain of this.#map.values()) {
            callback(terrain)
        }
    }
}