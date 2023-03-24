import { Color } from '/src/lib/color'


const SPEC = [
    {
        id: 0,
        name: 'Headwaters',
        width: .05,
        color: Color.fromHex('#4b8fb1'),
    },
    {
        id: 1,
        name: 'Fast course',
        width: .1,
        color: Color.fromHex('#2a83af'),
    },
    {
        id: 2,
        name: 'Slow course',
        width: .15,
        color: Color.fromHex('#26749b'),
    },
    {
        id: 3,
        name: 'Depositional',
        width: .2,
        color: Color.fromHex('#216384'),
    },
]

const TYPE_MAP = new Map(SPEC.map(spec => [spec.id, spec]))

export class RiverStretch {
    static fromId(id) {
        return TYPE_MAP.get(id) ?? SPEC[0]
    }
}


SPEC.forEach(spec => {
    const name = spec.name.toUpperCase().replace(/\s+/, '_')
    RiverStretch[name] = spec
})
