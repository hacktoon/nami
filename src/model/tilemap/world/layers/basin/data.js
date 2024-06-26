import { Color } from '/src/lib/color'


export class Basin {
    static parse(id) {
        return BASIN_MAP[id]
    }
}


export class OceanBasin extends Basin {
    static id = 0
    static name = 'Ocean'
    static color = Color.fromHex('#51a2d1')
}


export class SeaBasin extends Basin {
    static id = 1
    static name = 'Sea'
    static color = Color.fromHex('#7fc3c5')
}


export class LakeBasin extends Basin {
    static id = 2
    static name = 'Lake'
    static color = Color.fromHex('#6caca1')
}


export class RiverBedBasin extends Basin {
    static id = 3
    static name = 'RiverBed'
    static color = Color.fromHex('#285879')
}


const BASIN_MAP = {
    0: OceanBasin,
    1: SeaBasin,
    2: LakeBasin,
    3: RiverBedBasin,
}
