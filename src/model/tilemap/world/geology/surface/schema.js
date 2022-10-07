import { Color } from '/src/lib/color'
import { NOISE_SPEC } from './noise'


const TERRAIN_SPEC = [
    {
        id: 0,
        name: 'Abyss',
        water: true,
        color: Color.fromHex('#1d5674'),
    },
    {
        id: 1,
        name: 'Ocean',
        water: true,
        color: Color.fromHex('#216384'),
    },
    {
        id: 2,
        name: 'Sea',
        water: true,
        color: Color.fromHex('#2878a0'),
    },
    {
        id: 3,
        name: 'Basin',
        water: false,
        color: Color.fromHex('#71b13e'),
    },
    {
        id: 4,
        name: 'Plain',
        water: false,
        color: Color.fromHex('#99d966'),
    },
    {
        id: 5,
        name: 'Plateau',
        water: false,
        color: Color.fromHex('#c7d996'),
    },
    {
        id: 6,
        name: 'Mountain',
        water: false,
        color: Color.fromHex('#c0b896'),
    },
    {
        id: 7,
        name: 'Peak',
        water: false,
        color: Color.fromHex('#DDD'),
    }
]


const TYPE_MAP = new Map(TERRAIN_SPEC.map(spec => [spec.id, spec]))


export class Terrain {
    static fromId(id) {
        return new Terrain(TYPE_MAP.get(id))
    }

    static landTypes() {
        return TERRAIN_SPEC.filter(terrain => ! terrain.water)
    }

    static isLand(id) {
        return ! TYPE_MAP.get(id).water
    }

    static isWater(id) {
        return TYPE_MAP.get(id).water
    }

    constructor(spec) {
        this.id = spec.id
        this.name = spec.name
        this.water = spec.water
        this.color = spec.color
    }
}


TERRAIN_SPEC.forEach(spec => {
    const name = spec.name.toUpperCase()
    Terrain[name] = spec.id
})


export const BASE_NOISE = NOISE_SPEC.outline
export const BASE_RATIO = .55
export const LAYERS = [
    {
        terrain: Terrain.PLAIN,
        noise: NOISE_SPEC.outline,
        ratio: .6
    },
    {
        terrain: Terrain.PLATEAU,
        noise: NOISE_SPEC.grained,
        ratio: .42
    },
    {
        terrain: Terrain.MOUNTAIN,
        noise: NOISE_SPEC.feature,
        ratio: .45
    },
    {
        terrain: Terrain.PEAK,
        noise: NOISE_SPEC.grained,
        ratio: .65
    },
    {
        terrain: Terrain.OCEAN,
        noise: NOISE_SPEC.feature,
        ratio: .35
    },
    {
        terrain: Terrain.ABYSS,
        noise: NOISE_SPEC.grained,
        ratio: .60
    },
]
