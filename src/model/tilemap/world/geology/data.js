import { Color } from '/src/lib/color'


const TERRAIN_SPEC = [
    {
        id: 0,
        name: 'Abyss',
        water: true,
        color: Color.fromHex('#1d5674'),
        noise: 'grained',
        ratio: .60
    },
    {
        id: 1,
        name: 'Ocean',
        water: true,
        color: Color.fromHex('#216384'),
        noise: 'feature',
        ratio: .35
    },
    {
        id: 2,
        name: 'Sea',
        water: true,
        color: Color.fromHex('#2878a0'),
        noise: '',
        ratio: 1
    },
    {
        id: 3,
        name: 'Basin',
        water: false,
        color: Color.fromHex('#71b13e'),
        noise: 'feature',
        ratio: .3
    },
    {
        id: 4,
        name: 'Plain',
        water: false,
        color: Color.fromHex('#99d966'),
        noise: 'grained',
        ratio: .5
    },
    {
        id: 5,
        name: 'Plateau',
        water: false,
        color: Color.fromHex('#c7d996'),
        noise: 'feature',
        ratio: .5
    },
    {
        id: 6,
        name: 'Mountain',
        water: false,
        color: Color.fromHex('#c0b896'),
        noise: 'feature',
        ratio: 1
    }
]


export const TYPE_MAP = new Map(TERRAIN_SPEC.map(spec => [spec.id, spec]))

export class Terrain {
    static types = TERRAIN_SPEC

    static fromId(id) {
        // TOFIX: magic number
        return TYPE_MAP.get(id) ?? TYPE_MAP.get(2)
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
