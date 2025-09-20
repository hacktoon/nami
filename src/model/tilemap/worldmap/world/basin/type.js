import { Color } from '/src/lib/color'


export class Basin {
    static parse(id) {
        return BASIN_MAP[id]
    }
}


export class ExorheicBasin extends Basin {
    static id = 0
    static name = 'Exorheic river'
    static reach = Infinity
    static color = Color.fromHex('#38a378')
}


export class EndorheicSeaBasin extends Basin {
    static id = 1
    static name = 'Endorheic sea'
    static reach = 1
    static color = Color.fromHex('#7fc3c5')
}


export class EndorheicLakeBasin extends Basin {
    static id = 2
    static name = 'Endorheic lake'
    static reach = 0
    static color = Color.fromHex('#6caca1')
}


export class OceanBasin extends Basin {
    static id = 3
    static name = 'Ocean'
    static reach = Infinity
    static color = Color.fromHex('#285879')
}


export class DiffuseBasin extends Basin {
    static id = 4
    static name = 'Diffuse'
    static reach = 0
    static color = Color.fromHex('#a5b0b7')
}


/* CHUNK BASIN TYPES ***************************/
export class ValleyChunkBasin extends Basin {
    static id = 5
    static name = 'ValleyChunk'
    static color = Color.fromHex('#3f4693')
}


export class FloodPlainChunkBasin extends Basin {
    static id = 6
    static name = 'FloodPlainChunk'
    static color = Color.fromHex('#2c8746')
}


export class LowLandChunkBasin extends Basin {
    static id = 7
    static name = 'LowLandChunk'
    static color = Color.fromHex('#80b058')
}


export class HighLandChunkBasin extends Basin {
    static id = 8
    static name = 'HighLandChunk'
    static color = Color.fromHex('#a4cf80')
}


const BASIN_MAP = {
    0: ExorheicBasin,
    1: EndorheicSeaBasin,
    2: EndorheicLakeBasin,
    3: OceanBasin,
    4: DiffuseBasin,
    5: ValleyChunkBasin,
    6: FloodPlainChunkBasin,
    7: LowLandChunkBasin,
    8: HighLandChunkBasin,
}
