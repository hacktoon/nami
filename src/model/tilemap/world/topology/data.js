import { Color } from '/src/lib/color'


const SPEC = [
    {
        id: 0,
        name: 'Capital',
        color: Color.fromHex('#2d4f5f'),
    },
    {
        id: 1,
        name: 'City',
        color: Color.fromHex('#bbbbbb'),
    },
    {
        id: 2,
        name: 'Village',
        color: Color.fromHex('#977979'),
    },
    {
        id: 3,
        name: 'Ruins',
        color: Color.fromHex('#3a472b'),
    },
    {
        id: 4,
        name: 'Cave',
        color: Color.fromHex('#352727'),
    },
    {
        id: 5,
        name: 'Fortress',
        color: Color.fromHex('#535353'),
    },
]


const TYPE_MAP = new Map(SPEC.map(spec => [spec.id, spec]))


export class Place {
    static fromId(id) {
        return new Place(TYPE_MAP.get(id))
    }

    constructor(spec) {
        this.id = spec.id
        this.name = spec.name
        this.color = spec.color
    }
}


SPEC.forEach(spec => {
    const name = spec.name.toUpperCase()
    // add object as constant
    Place[name] = new Place(spec)
    // add method for comparison
    Place.prototype[`is${spec.name}`] = function() {
        return this.id === spec.id
    }
})
