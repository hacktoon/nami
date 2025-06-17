import { Color } from '/src/lib/color'


export const EMPTY = null


export class Basin {
    static color = Color.fromHex('#8c8c8c')

    static parse(id) {
        return BASIN_MAP[id]
    }
}


export class ExorheicRiverBasin extends Basin {
    static id = 0
    static name = 'Exorheic river'
    static reach = Infinity
    static isEndorheic = false
    static hasPermanentRivers = true
    static color = Color.fromHex('#51a2d1')
}


export class EndorheicSeaBasin extends Basin {
    static id = 1
    static name = 'Endorheic sea'
    static reach = 1
    static isEndorheic = true
    static hasPermanentRivers = true
    static color = Color.fromHex('#7fc3c5')
}


export class EndorheicLakeBasin extends Basin {
    static id = 2
    static name = 'Endorheic lake'
    static reach = 0
    static isEndorheic = true
    static hasPermanentRivers = true
    static color = Color.fromHex('#6caca1')
}


export class OceanicBasin extends Basin {
    static id = 3
    static name = 'Oceanic'
    static reach = Infinity
    static isEndorheic = false
    static hasPermanentRivers = true
    static color = Color.fromHex('#285879')
}


export class DiffuseBasin extends Basin {
    static id = 4
    static name = 'Diffuse'
    static reach = 0
    static isEndorheic = false
    static hasPermanentRivers = false
    static color = Color.fromHex('#9b8d49')
}


const BASIN_MAP = {
    0: ExorheicRiverBasin,
    1: EndorheicSeaBasin,
    2: EndorheicLakeBasin,
    3: OceanicBasin,
    4: DiffuseBasin
}
