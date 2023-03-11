import { Color } from '/src/lib/color'


const SPEC = [
    {
        id: 0,
        name: 'Source',
        color: Color.fromHex('#11425a'),
    },
]

const TYPE_MAP = new Map(SPEC.map(spec => [spec.id, spec]))

export class River {
    static fromId(id) {
        return TYPE_MAP.get(id) ?? SPEC[0]
    }
}


SPEC.forEach(spec => {
    const name = spec.name.toUpperCase().replace(/\s+/, '_')
    River[name] = spec
})
