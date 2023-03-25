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


export class Lake {
    static FRESH = Spec.build({name: 'Fresh', color: '#4b8fb1'})
    static FROZEN = Spec.build({name: 'Frozen', color: '#c1d1da'})
    static SWAMP = Spec.build({name: 'Swamp', color: '#417449'})
    static SALT = Spec.build({name: 'Salt', color: '#EEEEEE'})
    static ESTUARY = Spec.build({name: 'Estuary', color: '#437c7e'})
    static OASIS = Spec.build({name: 'Oasis', color: '#92c7ae'})

    static get(id) {
        return Spec.get(id)
    }
}
