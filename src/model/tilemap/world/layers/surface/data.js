import { Color } from '/src/lib/color'

export class Surface {
    static parse(id) {
        return SURFACE_MAP[id]
    }
}


export class OceanSurface extends Surface {
    static id = 0
    static name = 'Ocean'
    static water = true
    static color = Color.fromHex('#1d2255')
}


export class SeaSurface extends Surface {
    static id = 1
    static name = 'Sea'
    static water = true
    static color = Color.fromHex('#216384')
}

export class IslandSurface extends Surface {
    static id = 2
    static name = 'Island'
    static water = false
    static color = Color.fromHex('#c5ed7d')
}

export class ContinentSurface extends Surface {
    static id = 3
    static name = 'Continent'
    static water = false
    static color = Color.fromHex('#71b13e')
}


const SURFACE_MAP = {
    0: OceanSurface,
    1: SeaSurface,
    2: IslandSurface,
    3: ContinentSurface,
}