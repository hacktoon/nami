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


export class Rain {
    static HUMID = Spec.build({name: 'Humid', color: '#b067ff'})
    static WET = Spec.build({name: 'Wet', color: '#8567ff'})
    static SEASONAL = Spec.build({name: 'Seasonal', color: '#89abff'})
    static DRY = Spec.build({name: 'Dry', color: '#c8ffc9'})
    static ARID = Spec.build({name: 'Arid', color: '#ffce64'})

    static get(id) {
        return Spec.get(id)
    }
}
