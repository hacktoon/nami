import { Color } from '/src/lib/color'


const SPEC = [
    {
        id: 0,
        name: 'Trench',
        water: true,
        color: Color.fromHex('#11425a'),
    },
    {
        id: 1,
        name: 'Abyss',
        water: true,
        color: Color.fromHex('#185574'),
    },
    {
        id: 2,
        name: 'Ocean',
        water: true,
        color: Color.fromHex('#216384'),
    },
    {
        id: 3,
        name: 'Platform',
        water: true,
        color: Color.fromHex('#2878a0'),
    },
    {
        id: 4,
        name: 'Basin',
        water: false,
        color: Color.fromHex('#71b13e'),
    },
    {
        id: 5,
        name: 'Plain',
        water: false,
        color: Color.fromHex('#99d966'),
    },
    {
        id: 6,
        name: 'Plateau',
        water: false,
        color: Color.fromHex('#c7d996'),
    },
    {
        id: 7,
        name: 'Mountain',
        water: false,
        color: Color.fromHex('#a79f7f'),
    }
]

const TYPE_MAP = new Map(SPEC.map(spec => [spec.id, spec]))

export class Relief {
    static fromId(id) {
        return TYPE_MAP.get(id) ?? SPEC[0]
    }

    static isLand(id) {
        return TYPE_MAP.has(id) && ! TYPE_MAP.get(id).water
    }
}


SPEC.forEach(spec => {
    const name = spec.name.toUpperCase().replace(/\s+/, '_')
    Relief[name] = spec
})
