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


export class Relief {
    static TRENCH = Spec.build({name: 'Trench', color: '#11425a'})
    static ABYSS = Spec.build({name: 'Abyss', color: '#185574'})
    static OCEAN = Spec.build({name: 'Ocean', color: '#216384'})
    static PLATFORM = Spec.build({name: 'Platform', color: '#2878a0'})
    static PLAIN = Spec.build({name: 'Plain', color: '#77AA77'})
    static HILL = Spec.build({name: 'Hill', color: '#88BB88'})
    static PLATEAU = Spec.build({name: 'Plateau', color: '#95af8b'})
    static MOUNTAIN = Spec.build({name: 'Mountain', color: '#badfba'})

    static get(id) {
        return Spec.get(id)
    }
}

