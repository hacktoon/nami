import { Color } from '/src/lib/color'
import { clamp } from '/src/lib/number'


const LOWER = 1
const HIGHER = 4
const SPEC = [
    {
        id: 1,
        name: 'Frozen',
        color: Color.fromHex('#c4fdff'),
    },
    {
        id: 2,
        name: 'Temperate',
        color: Color.fromHex('#7be47f'),
    },
    {
        id: 3,
        name: 'SubTropical',
        color: Color.fromHex('#ffe500'),
    },
    {
        id: 4,
        name: 'Tropical',
        color: Color.fromHex('#ff5922'),
    }
]


const TYPE_MAP = new Map(SPEC.map(spec => [spec.id, spec]))


export class Temperature {
    static fromId(id) {
        return TYPE_MAP.get(id) ?? SPEC[0]
    }

    static lower(spec) {
        const id = clamp(spec.id - 1, LOWER, HIGHER)
        return TYPE_MAP.get(id)
    }
}

// add object ref to class as an attribute
SPEC.forEach(spec => {
    const name = spec.name.toUpperCase()
    Temperature[name] = spec
})
