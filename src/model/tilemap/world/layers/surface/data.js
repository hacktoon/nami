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


export class Surface {
    static OCEAN = Spec.build({name: 'Ocean', water: true, color: '#1d2255'})
    static SEA = Spec.build({name: 'Sea', water: true, color: '#216384'})
    static CONTINENT = Spec.build({name: 'Continent', water: false, color: '#71b13e'})
    static ISLAND = Spec.build({name: 'Island', water: false, color: '#c5ed7d'})

    static get(id) {
        return Spec.get(id)
    }
}
