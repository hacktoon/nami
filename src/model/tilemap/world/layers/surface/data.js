import { Color } from '/src/lib/color'


export class Surface {
    static parse(id) {
        return SURFACE_MAP[id]
    }
}


export class WaterSurface extends Surface {
    static id = 0
    static name = 'Water'
    static water = true
    static color = Color.fromHex('#1d2255')
}

export class LandSurface extends Surface {
    static id = 1
    static name = 'Land'
    static water = false
    static color = Color.fromHex('#71b13e')
}

const SURFACE_MAP = {
    0: WaterSurface,
    1: LandSurface,
}