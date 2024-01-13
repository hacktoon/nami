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


export class Place {
    static CAPITAL = Spec.build({name: 'Capital', color: '#2d4f5f'})
    static CITY = Spec.build({name: 'City', color: '#bbbbbb'})
    static VILLAGE = Spec.build({name: 'Village', color: '#977979'})
    static RUINS = Spec.build({name: 'Ruins', color: '#3a472b'})
    static CAVE = Spec.build({name: 'Cave', color: '#352727'})
    static FORTRESS = Spec.build({name: 'Fortress', color: '#535353'})

    static get(id) {
        return Spec.get(id)
    }
}
