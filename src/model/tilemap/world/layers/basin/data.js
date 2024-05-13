import { Color } from '/src/lib/color'


export class Basin {
    static parse(id) {
        return BASIN_MAP[id]
    }
}


export class ContinentBasin extends Basin {
    static id = 0
    static name = 'Continent'
    static color = Color.fromHex('#51a2d1')
}


export class LakeBasin extends Basin {
    static id = 1
    static name = 'Lake'
    static color = Color.fromHex('#6caca1')
}


export class SeaBasin extends Basin {
    static id = 2
    static name = 'Sea'
    static color = Color.fromHex('#7fc3c5')
}


const BASIN_MAP = {
    0: ContinentBasin,
    1: LakeBasin,
    2: SeaBasin,
}
