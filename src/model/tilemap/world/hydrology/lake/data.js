import { Color } from '/src/lib/color'


const SPEC = [
    {
        id: 0,
        name: 'Fresh',
        color: Color.fromHex('#4b8fb1'),
    },
    {
        id: 1,
        name: 'Swamp',
        color: Color.fromHex('#2a83af'),
    },
    {
        id: 2,
        name: 'Salt',
        color: Color.fromHex('#26749b'),
    },
    {
        id: 3,
        name: 'Lagoon',
        color: Color.fromHex('#216384'),
    },
    {
        id: 4,
        name: 'Oasis',
        color: Color.fromHex('#216384'),
    },
]

const TYPE_MAP = new Map(SPEC.map(spec => [spec.id, spec]))

export class Lake {
    static fromId(id) {
        return TYPE_MAP.get(id) ?? SPEC[0]
    }
}


SPEC.forEach(spec => {
    const name = spec.name.toUpperCase().replace(/\s+/, '_')
    Lake[name] = spec
})
