import { Color } from '/src/lib/color'

export const OCEAN = 0
export const LAKE = 1
export const CONTINENT = 2
export const ISLAND = 3

export const BASE_RATIO = .55
export const BASE_NOISE = 'outline'

export const GEOTYPE_SPEC = [
    {
        id: OCEAN,
        name: 'Ocean',
        water: true,
        color: Color.fromHex('#1d2255'),
    },
    {
        id: LAKE,
        name: 'Lake',
        water: true,
        color: Color.fromHex('#216384'),
    },
    {
        id: CONTINENT,
        name: 'Continent',
        water: false,
        color: Color.fromHex('#71b13e'),
    },
    {
        id: ISLAND,
        name: 'Island',
        water: false,
        color: Color.fromHex('#c5ed7d'),
    }
]


export const GEOTYPE_MAP = new Map(GEOTYPE_SPEC.map(spec => [spec.id, spec]))


export class Geotype {
    static fromId(id) {
        return GEOTYPE_MAP.get(id)
    }

    static isWater(id) {
        return GEOTYPE_MAP.get(id).water
    }
}
GEOTYPE_SPEC.forEach(spec => {
    const name = spec.name.toUpperCase()
    Geotype[name] = spec.id
})
