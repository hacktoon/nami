import { Color } from '/src/lib/color'


export class Surface {
    static parse(id) {
        return SURFACE_MAP[id]
    }
}

export class LakeSurface {
    static id = 0
    static name = 'Lake'
    static isWater = true
    static isBorder = false
    static color = Color.fromHex('#218484')
}

export class SeaSurface {
    static id = 1
    static name = 'Sea'
    static isWater = true
    static isBorder = false
    static color = Color.fromHex('#216384')
}

export class OceanSurface {
    static id = 2
    static name = 'Ocean'
    static isWater = true
    static isBorder = false
    static color = Color.fromHex('#1d2255')
}

export class IslandSurface {
    static id = 3
    static name = 'Island'
    static isWater = false
    static isBorder = false
    static color = Color.fromHex('#c5ed7d')
}

export class ContinentSurface {
    static id = 4
    static name = 'Continent'
    static isWater = false
    static isBorder = false
    static color = Color.fromHex('#71b13e')
}

export class LakeBorderSurface {
    static id = 5
    static name = 'Lake border'
    static isWater = true
    static isBorder = true
    static color = Color.fromHex('#0D7070')
}

export class SeaBorderSurface {
    static id = 6
    static name = 'Sea border'
    static isWater = true
    static isBorder = true
    static color = Color.fromHex('#0D4F70')
}

export class OceanBorderSurface {
    static id = 7
    static name = 'Ocean border'
    static isWater = true
    static isBorder = true
    static color = Color.fromHex('#090E41')
}

export class IslandBorderSurface {
    static id = 8
    static name = 'Island border'
    static isWater = false
    static isBorder = true
    static color = Color.fromHex('#B1D969')
}

export class ContinentBorderSurface {
    static id = 9
    static name = 'Continent border'
    static isWater = false
    static isBorder = true
    static color = Color.fromHex('#5D9D2A')
}


const SURFACE_MAP = {
    0: LakeSurface,
    1: SeaSurface,
    2: OceanSurface,
    3: IslandSurface,
    4: ContinentSurface,
    5: LakeBorderSurface,
    6: SeaBorderSurface,
    7: OceanBorderSurface,
    8: IslandBorderSurface,
    9: ContinentBorderSurface,
}