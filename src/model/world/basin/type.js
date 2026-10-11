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


export class StretchType {
    static parse(id) {
        return STRETCH_MAP[id]
    }

    static merge(stretch0, stretch1) {
        if (stretch0.id == HeadwaterStretch.id) {

        }
    }
}


export class HeadwaterStretch extends StretchType {
    static id = 1
    static name = 'Headwater'
    static color = Color.fromHex('#3fa5d1')
}

export class TorrentStretch extends StretchType {
    static id = 2
    static name = 'Torrent'
    static color = Color.fromHex('#2893c1')
}

export class RiffleStretch extends StretchType {
    static id = 3
    static name = 'Riffle'
    static color = Color.fromHex('#2893c1')
}

export class MeanderStretch extends StretchType {
    static id = 4
    static name = 'Meander'
    static color = Color.fromHex('#26749b')
}

export class DepositionalStretch extends StretchType {
    static id = 5
    static name = 'Depositional'
    static color = Color.fromHex('#216384')
}


const STRETCH_MAP = {
    1: HeadwaterStretch,
    2: TorrentStretch,
    3: RiffleStretch,
    4: MeanderStretch,
    5: DepositionalStretch,
}
