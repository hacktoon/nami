import { Color } from '/src/lib/color'

export const SURFACE_RATIO = .55
export const BASE_NOISE = 'outline'

export const SURFACE_SPEC = [
    {
        id: 0,
        name: 'Ocean',
        water: true,
        color: Color.fromHex('#1d2255'),
    },
    {
        id: 1,
        name: 'Sea',
        water: true,
        color: Color.fromHex('#216384'),
    },
    {
        id: 2,
        name: 'Continent',
        water: false,
        color: Color.fromHex('#71b13e'),
    },
    {
        id: 3,
        name: 'Island',
        water: false,
        color: Color.fromHex('#c5ed7d'),
    },
    {
        id: 4,
        name: 'Depression',
        water: false,
        color: Color.fromHex('#787257'),
    }
]


export const SURFACE_MAP = new Map(SURFACE_SPEC.map(spec => [spec.id, spec]))


export class Surface {
    static fromId(id) {
        return SURFACE_MAP.get(id)
    }

    static isWater(id) {
        return SURFACE_MAP.get(id).water
    }

    static isLand(id) {
        return ! SURFACE_MAP.get(id).water
    }
}
SURFACE_SPEC.forEach(spec => {
    const name = spec.name.toUpperCase()
    Surface[name] = spec.id
})