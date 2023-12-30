import { Color } from '/src/lib/color'


export class Surface {
    static parse(id) {
        return SURFACE_MAP[id]
    }
}

export class LakeSurface extends Surface {
    static id = 0
    static name = 'Lake'
    static water = true
    static color = Color.fromHex('#2c3274')
}

export class OceanSurface extends Surface {
    static id = 1
    static name = 'Ocean'
    static water = true
    static color = Color.fromHex('#1d2255')
}

export class IslandSurface extends Surface {
    static id = 2
    static name = 'Island'
    static water = false
    static color = Color.fromHex('#a0b13e')
}

export class ContinentSurface extends Surface {
    static id = 3
    static name = 'Continent'
    static water = false
    static color = Color.fromHex('#71b13e')
}


const SURFACE_MAP = {
    0: LakeSurface,
    1: OceanSurface,
    2: IslandSurface,
    3: ContinentSurface,
}