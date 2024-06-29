import { Color } from '/src/lib/color'


class Spec {
    static total = 0
    static map = new Map()

    static build(spec) {
        const id = Spec.total++
        const item = {...spec, id, color: Color.fromHex(spec.color)}
        Spec.map.set(id, item)
        return item
    }

    static get(id) {
        return Spec.map.get(id)
    }
}


export class RiverStretch {
    static HEADWATERS = Spec.build({
        name: 'Headwaters', width: .05, color: '#2893c1'
    })
    static FAST_COURSE = Spec.build({
        name: 'Fast course', width: .1, color: '#2a83af'
    })
    static SLOW_COURSE = Spec.build({
        name: 'Slow course', width: .15, color: '#26749b'
    })
    static DEPOSITIONAL = Spec.build({
        name: 'Depositional', width: .2, color: '#216384'
    })


    static get(id) {
        return Spec.get(id)
    }
}

