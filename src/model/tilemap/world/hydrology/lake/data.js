import { Color } from '/src/lib/color'


const SPEC = [
    {
        id: 0,
        name: 'Fresh',
        color: Color.fromHex('#4b8fb1'),
    },
    {
        id: 1,
        name: 'Frozen',
        color: Color.fromHex('#c1d1da'),
    },
    {
        id: 2,
        name: 'Swamp',
        color: Color.fromHex('#417449'),
    },
    {
        id: 3,
        name: 'Salt',
        color: Color.fromHex('#ccd4da'),
    },
    {
        id: 4,
        name: 'Estuary',
        color: Color.fromHex('#437c7e'),
    },
    {
        id: 5,
        name: 'Oasis',
        color: Color.fromHex('#92c7ae'),
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
