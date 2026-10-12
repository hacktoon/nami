import { clamp } from '/src/lib/function'
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


export class Stretch {
    static parse(stretchId) {
        const ids = Array.from(STRETCH_MAP.keys())
        const id = clamp(stretchId, ids[0], ids.at(-1))
        return STRETCH_MAP.get(id)
    }
}


export class HeadwaterStretch extends Stretch {
    static id = 1
    static name = 'Headwater'
    static width = 3
    static color = Color.fromHex('#2893c1')
}

export class TorrentStretch extends Stretch {
    static id = 2
    static name = 'Torrent'
    static width = 8
    static color = Color.fromHex('#2086b2')
}

export class RiffleStretch extends Stretch {
    static id = 3
    static name = 'Riffle'
    static width = 13
    static color = Color.fromHex('#16749c')
}

export class MeanderStretch extends Stretch {
    static id = 4
    static name = 'Meander'
    static width = 16
    static color = Color.fromHex('#12758b')
}

export class DepositionalStretch extends Stretch {
    static id = 5
    static name = 'Depositional'
    static width = 23
    static color = Color.fromHex('#345671')
}


const STRETCH_MAP = new Map([
    [1, HeadwaterStretch],
    [2, TorrentStretch],
    [3, RiffleStretch],
    [4, MeanderStretch],
    [5, DepositionalStretch],
])
