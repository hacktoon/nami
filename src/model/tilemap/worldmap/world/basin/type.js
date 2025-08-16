import { Color } from '/src/lib/color'


export class Basin {
    static color = Color.fromHex('#8c8c8c')

    static parse(id) {
        return BASIN_MAP[id]
    }
}


export class ExorheicBasin extends Basin {
    static id = 0
    static name = 'Exorheic river'
    static reach = Infinity
    static hasRivers = true
    static color = Color.fromHex('#38a378')
}


export class EndorheicSeaBasin extends Basin {
    static id = 1
    static name = 'Endorheic sea'
    static reach = 1
    static hasRivers = true
    static color = Color.fromHex('#7fc3c5')
}


export class EndorheicLakeBasin extends Basin {
    static id = 2
    static name = 'Endorheic lake'
    static reach = 0
    static hasRivers = true
    static color = Color.fromHex('#6caca1')
}


export class WaterBasin extends Basin {
    static id = 3
    static name = 'Water'
    static reach = Infinity
    static hasRivers = false
    static color = Color.fromHex('#285879')
}


const BASIN_MAP = {
    0: ExorheicBasin,
    1: EndorheicSeaBasin,
    2: EndorheicLakeBasin,
    3: WaterBasin,
}
