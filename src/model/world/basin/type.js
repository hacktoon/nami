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


export class Basin {
    static parse(id) {
        return BASIN_MAP[id]
    }
}


export class ExorheicBasin extends Basin {
    static id = 0
    static name = 'Exorheic river'
    static reach = Infinity
    static color = Color.fromHex('#3ea87e')
}


export class EndorheicSeaBasin extends Basin {
    static id = 1
    static name = 'Endorheic sea'
    static reach = 2
    static color = Color.fromHex('#7fc3c5')
}


export class EndorheicLakeBasin extends Basin {
    static id = 2
    static name = 'Endorheic lake'
    static reach = 1
    static color = Color.fromHex('#6caca1')
}


export class OceanBasin extends Basin {
    static id = 3
    static name = 'Ocean'
    static reach = Infinity
    static color = Color.fromHex('#285879')
}


const BASIN_MAP = {
    0: ExorheicBasin,
    1: EndorheicSeaBasin,
    2: EndorheicLakeBasin,
    3: OceanBasin
}


export class RiverStretch {
    static parse(id) {
        return STRETCH_MAP[id]
    }
}


export class SourceStretch extends RiverStretch {
    static id = 0
    static name = 'River source'
    static width = 4
    static color = Color.fromHex('#2893c1')
}


export class TransitionalStretch extends RiverStretch {
    static id = 1
    static name = 'River transition'
    static width = 10
    static color = Color.fromHex('#26749b')
}


export class DepositionalStretch extends RiverStretch {
    static id = 2
    static name = 'River mouth'
    static width = 13
    static color = Color.fromHex('#216384')
}


const STRETCH_MAP = {
    0: SourceStretch,
    1: TransitionalStretch,
    2: DepositionalStretch,
}
