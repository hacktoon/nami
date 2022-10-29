import { Color } from '/src/lib/color'


// geomass
export const OCEAN = 0
export const SEA = 1
export const LAKE = 2
export const CONTINENT = 3
export const ISLAND = 4


export const GEOTYPE_SPEC = [
    {
        id: 0,
        name: 'Ocean',
        water: true,
        color: Color.fromHex('#1d2255'),
    },
    {
        id: 1,
        name: 'Sea',
        water: true,
        color: Color.fromHex('#216384'),
    },
    {
        id: 2,
        name: 'Lake',
        water: true,
        color: Color.fromHex('#87e0ed'),
    },
    {
        id: 3,
        name: 'Continent',
        water: false,
        color: Color.fromHex('#71b13e'),
    },
    {
        id: 4,
        name: 'Island',
        water: false,
        color: Color.fromHex('#c5ed7d'),
    }
]


export const TERRAIN_SPEC = [
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


export const TYPE_MAP = new Map(TERRAIN_SPEC.map(spec => [spec.id, spec]))
export const GEOTYPE_MAP = new Map(GEOTYPE_SPEC.map(spec => [spec.id, spec]))


export class Geotype {
    static fromId(id) {
        return new Geotype(GEOTYPE_MAP.get(id))
    }

    constructor(spec) {
        this.id = spec.id
        this.name = spec.name
        this.water = spec.water
        this.color = spec.color
    }
}
GEOTYPE_SPEC.forEach(spec => {
    const name = spec.name.toUpperCase()
    Geotype[name] = spec.id
})


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
        this.color = spec.color
    }
}


TERRAIN_SPEC.forEach(spec => {
    const name = spec.name.toUpperCase()
    Terrain[name] = spec.id
})


export const BASE_NOISE = 'outline'
export const BASE_RATIO = .55
export const LAYERS = [
    {
        terrain: Terrain.PLAIN,
        noise: 'outline',
        ratio: .6
    },
    {
        terrain: Terrain.PLATEAU,
        noise: 'grained',
        ratio: .42
    },
    {
        terrain: Terrain.MOUNTAIN,
        noise: 'feature',
        ratio: .45
    },
    {
        terrain: Terrain.PEAK,
        noise: 'grained',
        ratio: .65
    },
    {
        terrain: Terrain.OCEAN,
        noise: 'feature',
        ratio: .35
    },
    {
        terrain: Terrain.ABYSS,
        noise: 'grained',
        ratio: .60
    },
]
