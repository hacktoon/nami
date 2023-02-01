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
        name: 'Warm',
        color: Color.fromHex('#ffe500'),
    },
    {
        id: 5,
        name: 'Hot',
        color: Color.fromHex('#ff5922'),
    }
]

const TYPE_MAP = new Map(SPEC.map(spec => [spec.id, spec]))


export class Temperature {
    static lower(spec) {
        const lower = SPEC[0].id
        const higher = SPEC[SPEC.length-1].id
        const id = clamp(spec.id - 1, lower, higher)
        return new Temperature(TYPE_MAP.get(id))
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
    Temperature[name] = new Temperature(spec)
    // add method for comparison
    Temperature.prototype[methodName] = function() {
        return this.id === spec.id
    }
})
