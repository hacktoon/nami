import { Color } from '/src/lib/color'


const SPEC = [
    {
        id: 0,
        name: 'Headwaters',
        width: .05,
        color: Color.fromHex('#8fa7b3'),
    },
    {
        id: 1,
        name: 'Fast course',
        width: .1,
        color: Color.fromHex('#2f6d8b'),
    },
    {
        id: 2,
        name: 'Slow course',
        width: .16,
        color: Color.fromHex('#356881'),
    },
    {
        id: 3,
        name: 'Depositional',
        width: .25,
        color: Color.fromHex('#57c7ab'),
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
