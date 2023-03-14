import { Color } from '/src/lib/color'


const STRETCH_SPEC = [
    {
        id: 0,
        name: 'Spring',
        color: Color.fromHex('#11425a'),
    },
    {
        id: 1,
        name: 'Waterfall',
        color: Color.fromHex('#11425a'),
    },
    {
        id: 1,
        name: 'Rapids',
        color: Color.fromHex('#11425a'),
    },
    {
        id: 1,
        name: 'Delta',
        color: Color.fromHex('#11425a'),
    },
    {
        id: 1,
        name: 'Estuary',
        color: Color.fromHex('#11425a'),
    },
]

const TYPE_MAP = new Map(STRETCH_SPEC.map(spec => [spec.id, spec]))

export class River {
    static fromId(id) {
        return TYPE_MAP.get(id) ?? STRETCH_SPEC[0]
    }
}


STRETCH_SPEC.forEach(spec => {
    const name = spec.name.toUpperCase().replace(/\s+/, '_')
    River[name] = spec
})
