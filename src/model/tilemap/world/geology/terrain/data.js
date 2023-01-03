import { Color } from '/src/lib/color'


const TERRAIN_SPEC = [
    {
        id: 0,
        name: 'Abyss',
        water: true,
        color: Color.fromHex('#1d5674'),
        ratio: 0.35
    },
    {
        id: 1,
        name: 'Ocean',
        water: true,
        color: Color.fromHex('#216384'),
        ratio: 0.47
    },
    {
        id: 2,
        name: 'Sea',
        water: true,
        color: Color.fromHex('#2878a0'),
        ratio: .42
    },
    {
        id: 3,
        name: 'Basin',
        water: false,
        color: Color.fromHex('#71b13e'),
        ratio: 0
    },
    {
        id: 4,
        name: 'Plain',
        water: false,
        color: Color.fromHex('#99d966'),
        ratio: 0.4
    },
    {
        id: 5,
        name: 'Plateau',
        water: false,
        color: Color.fromHex('#c7d996'),
        ratio: .55
    },
    {
        id: 6,
        name: 'Mountain',
        water: false,
        color: Color.fromHex('#c0b896'),
        ratio: 0.5
    }
]


export const TYPE_MAP = new Map(TERRAIN_SPEC.map(spec => [spec.id, spec]))

export class Terrain {
    static types = TERRAIN_SPEC

    static fromId(id) {
        return TYPE_MAP.get(id) ?? TERRAIN_SPEC[0]
    }

    static isLand(id) {
        return TYPE_MAP.has(id) && ! TYPE_MAP.get(id).water
    }
}


TERRAIN_SPEC.forEach(spec => {
    const name = spec.name.toUpperCase()
    Terrain[name] = spec
})
