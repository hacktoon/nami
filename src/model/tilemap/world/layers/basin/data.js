import { Color } from '/src/lib/color'


export const EMPTY = null


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
    static isEndorheic = false
    static color = Color.fromHex('#51a2d1')
}


export class EndorheicSeaBasin extends Basin {
    static id = 1
    static name = 'Endorheic sea'
    static reach = 3
    static isEndorheic = true
    static color = Color.fromHex('#7fc3c5')
}


export class EndorheicLakeBasin extends Basin {
    static id = 2
    static name = 'Endorheic lake'
    static reach = 1
    static isEndorheic = true
    static color = Color.fromHex('#6caca1')
}


export class OceanicBasin extends Basin {
    static id = 3
    static name = 'Oceanic'
    static reach = Infinity
    static isEndorheic = false
    static color = Color.fromHex('#285879')
}


const BASIN_MAP = {
    0: ExorheicBasin,
    1: EndorheicSeaBasin,
    2: EndorheicLakeBasin,
    3: OceanicBasin,
}
