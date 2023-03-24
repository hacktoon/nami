
class LandformSpec {
    static total = 0
    static map = new Map()

    static build(spec) {
        const id = LandformSpec.total++
        const item = {id, ...spec}
        LandformSpec.map.set(id, item)
        return item
    }

    static get(id) {
        return LandformSpec.map.get(id)
    }
}


export class Landform {
    static HYDROTHERMAL_VENTS = LandformSpec.build({
        name: 'Hydrothermal vents'
    })
    static ATOL = LandformSpec.build({name: 'Atol'})
    static SAND_BARS = LandformSpec.build({name: 'Sand bars'})
    static REEFS = LandformSpec.build({name: 'Reefs'})
    static DUNES = LandformSpec.build({name: 'Dunes'})
    static CANYON = LandformSpec.build({name: 'Canyon'})
    static MESA = LandformSpec.build({name: 'Mesa'})
    static VOLCANO = LandformSpec.build({name: 'Volcano'})
    static RAVINE = LandformSpec.build({name: 'Ravine'})
    static CRATER = LandformSpec.build({name: 'Crater'})

    static get(id) {
        return LandformSpec.get(id)
    }
}




