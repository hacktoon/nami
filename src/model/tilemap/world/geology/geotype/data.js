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


export const GEOTYPE_MAP = new Map(GEOTYPE_SPEC.map(spec => [spec.id, spec]))


export class Geotype {
    static fromId(id) {
        return new Geotype(GEOTYPE_MAP.get(id))
    }

    static isWater(id) {
        return GEOTYPE_MAP.get(id).water
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
