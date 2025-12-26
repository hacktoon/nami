import { Color } from '/src/lib/color'


export class Surface {
    static id = 0
    static name = 'Inner'
    static isWater = false
    static color = Color.BLACK

    static parse(id) {
        return SURFACE_MAP[id]
    }
}

export class LakeSurface {
    static id = 1
    static name = 'Lake'
    static isWater = true
    static color = Color.fromHex('#218484')
}

export class SeaSurface {
    static id = 2
    static name = 'Sea'
    static isWater = true
    static color = Color.fromHex('#216384')
}

export class OceanSurface {
    static id = 3
    static name = 'Ocean'
    static isWater = true
    static color = Color.fromHex('#1d2255')
}

export class IslandSurface {
    static id = 4
    static name = 'Island'
    static isWater = false
    static color = Color.fromHex('#c5ed7d')
}

export class ContinentSurface {
    static id = 5
    static name = 'Continent'
    static isWater = false
    static color = Color.fromHex('#71b13e')
}


const SURFACE_MAP = {
    0: Surface,
    1: LakeSurface,
    2: SeaSurface,
    3: OceanSurface,
    4: IslandSurface,
    5: ContinentSurface,
}