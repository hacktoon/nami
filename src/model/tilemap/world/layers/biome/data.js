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


export class Biome {
    static ICECAP = Spec.build({name: "Icecap", color: "#f2f2f2", })
    static TUNDRA = Spec.build({name: "Tundra", color: "#afe7da", })
    static TAIGA = Spec.build({name: "Taiga", color: "#56c472", })
    static WOODLANDS = Spec.build({name: "Woodlands", color: "#57aa13", })
    static JUNGLE = Spec.build({name: "Jungle", color: "#4b8b17", })
    static GRASSLANDS = Spec.build({name: "Grasslands", color: "#8abb63", })
    static SAVANNA = Spec.build({name: "Savanna", color: "#b5c23f", })
    static DESERT = Spec.build({name: "Desert", color: "#d1c69c", })
    static TRENCH = Spec.build({name: "Trench", color: "#1d5674", })
    static OCEAN = Spec.build({name: "Ocean", color: "#216384", })
    static SEA = Spec.build({name: "Sea", color: "#2878a0", })
    static REEF = Spec.build({name: "Reef", color: "#8ea2ce", })
    static MANGROVE = Spec.build({name: "Mangrove", color: "#437718", })

    static get(id) {
        return Spec.get(id)
    }
}
