import { Color } from '/src/lib/color'


const SPEC = [
    {
        id: 0,
        name: 'Trench',
        color: Color.fromHex('#11425a'),
    },
    {
        id: 1,
        name: 'Abyss',
        color: Color.fromHex('#185574'),
    },
    {
        id: 2,
        name: 'Ocean',
        color: Color.fromHex('#216384'),
    },
    {
        id: 3,
        name: 'Platform',
        color: Color.fromHex('#2878a0'),
    },
    {
        id: 4,
        name: 'Basin',
        color: Color.fromHex('#71b13e'),
    },
    {
        id: 5,
        name: 'Plain',
        color: Color.fromHex('#99d966'),
    },
    {
        id: 6,
        name: 'Plateau',
        color: Color.fromHex('#d3e27e'),
    },
    {
        id: 7,
        name: 'Mountain',
        color: Color.fromHex('#b8ad82'),
    },
    {
        id: 8,
        name: 'Peak',
        color: Color.fromHex('#dbd9cd'),
    }
]

const TYPE_MAP = new Map(SPEC.map(spec => [spec.id, spec]))

export class Relief {
    static fromId(id) {
        return TYPE_MAP.get(id) ?? SPEC[0]
    }
}


SPEC.forEach(spec => {
    const name = spec.name.toUpperCase().replace(/\s+/, '_')
    Relief[name] = spec
})
