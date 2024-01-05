import { Color } from '/src/lib/color'


export class Basin {
    static parse(id) {
        return BASIN_MAP[id]
    }
}


export class OldBasin extends Basin {
    static id = 0
    static name = 'Old'
    static color = Color.fromHex('#d8d79b')
}


export class RiverBasin extends Basin {
    static id = 1
    static name = 'River'
    static color = Color.fromHex('#51a2d1')
}


export class LakeBasin extends Basin {
    static id = 2
    static name = 'Lake'
    static color = Color.fromHex('#7b9ea7')
}


export class SeaBasin extends Basin {
    static id = 3
    static name = 'Sea'
    static color = Color.fromHex('#add3a1')
}


const BASIN_MAP = {
    0: OldBasin,
    1: RiverBasin,
    2: LakeBasin,
    3: SeaBasin,
}
