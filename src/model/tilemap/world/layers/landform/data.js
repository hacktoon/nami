
class Spec {
    static total = 0
    static map = new Map()

    static build(spec) {
        const id = Spec.total++
        const item = {id, ...spec}
        Spec.map.set(id, item)
        return item
    }

    static get(id) {
        return Spec.map.get(id)
    }
}


export class Landform {
    static HYDROTHERMAL_VENTS = Spec.build({
        name: 'Hydrothermal vents'
    })
    static ATOL = Spec.build({name: 'Atol'})
    static SAND_BARS = Spec.build({name: 'Sand bars'})
    static REEFS = Spec.build({name: 'Reefs'})
    static DUNES = Spec.build({name: 'Dunes'})
    static CANYON = Spec.build({name: 'Canyon'})
    static MESA = Spec.build({name: 'Mesa'})
    static VOLCANO = Spec.build({name: 'Volcano'})
    static RAVINE = Spec.build({name: 'Ravine'})
    static CRATER = Spec.build({name: 'Crater'})

    static get(id) {
        return Spec.get(id)
    }
}




