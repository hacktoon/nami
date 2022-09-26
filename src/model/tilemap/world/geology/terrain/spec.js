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

    static types() {
        return TERRAIN_SPEC
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


export const PIPELINE = [
    [{
        noise: NOISE_SPEC.outline,
        terrain: Terrain.BASIN,
        baseTerrain: Terrain.SEA,
        ratio: .55
    }],
    [
        {
            noise: NOISE_SPEC.feature,
            terrain: Terrain.PLAIN,
            baseTerrain: Terrain.BASIN,
            ratio: .33
        },
        {
            noise: NOISE_SPEC.outline,
            terrain: Terrain.OCEAN,
            baseTerrain: Terrain.SEA,
            ratio: .47
        }
    ],
    [
        {
            noise: NOISE_SPEC.grained,
            terrain: Terrain.PLATEAU,
            baseTerrain: Terrain.PLAIN,
            ratio: .42
        },
        {
            noise: NOISE_SPEC.grained,
            terrain: Terrain.ABYSS,
            baseTerrain: Terrain.OCEAN,
            ratio: .4
        }
    ],
    [
        {
            noise: NOISE_SPEC.feature,
            terrain: Terrain.MOUNTAIN,
            baseTerrain: Terrain.PLATEAU,
            ratio: .45
        },
        {
            noise: NOISE_SPEC.feature,
            terrain: Terrain.SEA,
            baseTerrain: Terrain.OCEAN,
            ratio: .3
        }
    ],
    [
        {// put peaks on mountains
            noise: NOISE_SPEC.grained,
            terrain: Terrain.PEAK,
            baseTerrain: Terrain.MOUNTAIN,
            ratio: .65
        },
        {// put islands on sea
            noise: NOISE_SPEC.grained,
            terrain: Terrain.BASIN,
            baseTerrain: Terrain.SEA,
            ratio: .6
        },
    ],
]