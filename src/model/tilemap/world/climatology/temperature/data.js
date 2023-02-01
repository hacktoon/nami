import { Color } from '/src/lib/color'
import { clamp } from '/src/lib/number'


const SPEC = [
    {
        id: 1,
        name: 'Frozen',
        color: Color.fromHex('#EEE'),
    },
    {
        id: 2,
        name: 'Cold',
        color: Color.fromHex('#9cfceb'),
    },
    {
        id: 3,
        name: 'Temperate',
        color: Color.fromHex('#7be47f'),
    },
    {
        id: 4,
        name: 'SubTropical',
        color: Color.fromHex('#ffe500'),
    },
    {
        id: 5,
        name: 'Tropical',
        color: Color.fromHex('#ff5922'),
    }
]

const TYPE_MAP = new Map(SPEC.map(spec => [spec.id, spec]))


export class Temperature {
    static fromId(id) {
        return TYPE_MAP.get(id)
    }

    static lower(spec) {
        const lower = SPEC[0].id
        const higher = SPEC[SPEC.length-1].id
        const id = clamp(spec.id - 1, lower, higher)
        return TYPE_MAP.get(id)
    }
}

// add object ref to class as an attribute
SPEC.forEach(spec => {
    const name = spec.name.toUpperCase()
    Temperature[name] = spec
})
