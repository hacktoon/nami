import { Color } from '/src/lib/color'


export class Basin {
    static parse(id) {
        return BASIN_MAP[id]
    }
}


export class Ocean extends Basin {
    static id = 0
    static throughput = 0
    static name = 'Ocean'
    static color = Color.fromHex('#51a2d1')
}


export class SeaBasin extends Basin {
    static id = 1
    static throughput = 4
    static name = 'Sea'
    static color = Color.fromHex('#7fc3c5')
}


export class LakeBasin extends Basin {
    static id = 2
    static throughput = 1
    static name = 'Lake'
    static color = Color.fromHex('#6caca1')
}


const BASIN_MAP = {
    0: Ocean,
    1: SeaBasin,
    2: LakeBasin,
}
