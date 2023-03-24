import { Color } from '/src/lib/color'


const SPEC = [
    {
        id: 0,
        name: 'Humid',
        color: Color.fromHex('#b067ff'),
    },
    {
        id: 1,
        name: 'Wet',
        color: Color.fromHex('#8567ff'),
    },
    {
        id: 2,
        name: 'Seasonal',
        color: Color.fromHex('#89abff'),
    },
    {
        id: 3,
        name: 'Dry',
        color: Color.fromHex('#c8ffc9'),
    },
    {
        id: 4,
        name: 'Arid',
        color: Color.fromHex('#ffce64'),
    }
]


const TYPE_MAP = new Map(SPEC.map(spec => [spec.id, spec]))


export class Rain {
    static fromId(id) {
        return new Rain(TYPE_MAP.get(id))
    }

    constructor(spec) {
        this.id = spec.id
        this.name = spec.name
        this.color = spec.color
    }

    is(type) {
        return this.id === type.id
    }
}


SPEC.forEach(spec => {
    const name = spec.name.toUpperCase()
    // add object as constant
    Rain[name] = new Rain(spec)
})
