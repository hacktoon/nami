import { Color } from '/src/lib/color'


const BASE_NOISE_TYPE = 'base'
const RELIEF_NOISE_TYPE = 'relief'
const BASE_NOISE = {octaves: 6, resolution: .8, scale: .02}
const RELIEF_NOISE = {octaves: 6, resolution: .8, scale: .05}


const TERRAIN_SPEC = [
    {
        id: 0,
        name: 'Abyss',
        noise: BASE_NOISE_TYPE,
        ratio: 0,
        water: true,
        color: Color.fromHex('#1d5674'),
        erosible: false,
    },
    {
        id: 1,
        name: 'Ocean',
        noise: BASE_NOISE_TYPE,
        ratio: .2,
        water: true,
        color: Color.fromHex('#216384'),
        erosible: false,
    },
    {
        id: 2,
        name: 'Sea',
        noise: RELIEF_NOISE_TYPE,
        ratio: .45,
        water: true,
        color: Color.fromHex('#2878a0'),
        erosible: false,
    },
    {
        id: 3,
        name: 'Basin',
        noise: BASE_NOISE_TYPE,
        ratio: .55,
        water: false,
        color: Color.fromHex('#71b13e'),
        erosible: true,
    },
    {
        id: 4,
        name: 'Plain',
        noise: BASE_NOISE_TYPE,
        ratio: .6,
        water: false,
        color: Color.fromHex('#99d966'),
        erosible: true,
    },
    {
        id: 5,
        name: 'Plateau',
        noise: RELIEF_NOISE_TYPE,
        ratio: .5,
        water: false,
        color: Color.fromHex('#b6e491'),
        erosible: true,
    },
    {
        id: 6,
        name: 'Mountain',
        noise: RELIEF_NOISE_TYPE,
        ratio: .65,
        water: false,
        color: Color.fromHex('#c0b896'),
        erosible: true,
    },
    {
        id: 7,
        name: 'Peak',
        noise: RELIEF_NOISE_TYPE,
        ratio: .8,
        water: false,
        color: Color.fromHex('#DDD'),
        erosible: true,
    }
]


export class Terrain {
    constructor(spec) {
        this.id = spec.id
        this.name = spec.name
        this.noise = spec.noise
        this.ratio = spec.ratio
        this.water = spec.water
        this.color = spec.color
    }
}


export class TerrainCollection {
    #map

    constructor() {
        const entries = TERRAIN_SPEC.map(spec => [spec.id, new Terrain(spec)])
        this.#map = new Map(entries)
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
