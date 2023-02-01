import { Color } from '/src/lib/color'


const SPEC = [
    {
        id: 5,
        name: 'Humid',
        color: Color.fromHex('#b067ff'),
    },
    {
        id: 4,
        name: 'Wet',
        color: Color.fromHex('#8567ff'),
    },
    {
        id: 3,
        name: 'Seasonal',
        color: Color.fromHex('#89abff'),
    },
    {
        id: 2,
        name: 'Dry',
        color: Color.fromHex('#c8ffc9'),
    },
    {
        id: 1,
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
}


SPEC.forEach(spec => {
    const name = spec.name.toUpperCase()
    const methodName = `is${spec.name}`
    // add object as constant
    Rain[name] = new Rain(spec)
    // add method for comparison
    Rain.prototype[methodName] = function() {
        return this.id === spec.id
    }
})
