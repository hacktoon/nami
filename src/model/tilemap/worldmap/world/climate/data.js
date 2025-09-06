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


export class Climate {
    static FROZEN = Spec.build({name: 'Frozen', color: '#EEE'})
    static COLD = Spec.build({name: 'Cold', color: '#9cfceb'})
    static TEMPERATE = Spec.build({name: 'Temperate', color: '#7be47f'})
    static WARM = Spec.build({name: 'Warm', color: '#ffe500'})
    static HOT = Spec.build({name: 'Hot', color: '#ff5922'})

    static parse(id) {
        return Spec.get(id)
    }
}
