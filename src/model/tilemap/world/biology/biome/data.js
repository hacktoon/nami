import { Color } from '/src/lib/color'


export const BIOME_SPEC = [
    {
        name: 'Ocean',
        color: Color.fromHex('#1d2255'),
    },
]


export const SURFACE_MAP = new Map(BIOME_SPEC.map(spec => [spec.id, spec]))


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
BIOME_SPEC.forEach(spec => {
    const name = spec.name.toUpperCase()
    Surface[name] = spec.id
})
