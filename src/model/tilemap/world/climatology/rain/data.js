import { Color } from '/src/lib/color'


const SPEC = [
    {
        id: 4,
        name: 'Humid',
        color: Color.fromHex('#c4fdff'),
    },
    {
        id: 3,
        name: 'Seasonal',
        color: Color.fromHex('#7be47f'),
    },
    {
        id: 2,
        name: 'Dry',
        color: Color.fromHex('#ffe500'),
    },
    {
        id: 1,
        name: 'Arid',
        color: Color.fromHex('#ff5922'),
    }
]


const TYPE_MAP = new Map(SPEC.map(spec => [spec.id, spec]))


export class Rain {
    static fromId(id) {
        return TYPE_MAP.get(id) ?? SPEC[0]
    }
}

// add object ref to class as an attribute
SPEC.forEach(spec => {
    const name = spec.name.toUpperCase()
    Rain[name] = spec
})
