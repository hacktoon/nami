import { Color } from '/lib/base/color'

const NO_EDGE = 1
const ONLY_EDGE = 2


const BOUNDARIES = {
    NONE:             { id: 0, visible: false, color: '#000' },
    CONTINENTAL_RIFT: { id: 1, visible: true, color: '#0f4d4f' },
    OCEANIC_RIFT:     { id: 2, visible: false, color: '#42155f' },
    OROGENY:          { id: 3, visible: true, color: '#b7ad8f' },
    EARLY_OROGENY:    { id: 4, visible: true, color: '#a38216' },
    OCEANIC_TRENCH:   { id: 5, visible: true, color: '#001b36' },
    PASSIVE_MARGIN:   { id: 6, visible: true, color: '#07A' },
    ISLAND_ARC:       { id: 7, visible: true, color: '#3bd4c2' },
    TRANSFORM_FAULT:  { id: 8, visible: false, color: '#9aae6d' },
    OCEANIC_FAULT:    { id: 9, visible: false, color: '#003f6c' },
}


const BOUNDARY_MAP = (() => {
    const _map = new Map()
    for(const [name, props] of Object.entries(BOUNDARIES)) {
        _map.set(props.id, {...props, name})
    }
    return _map
})()


export class Boundary {
    static get NONE () { return BOUNDARIES.NONE.id }
    static get CONTINENTAL_RIFT () { return BOUNDARIES.CONTINENTAL_RIFT.id }
    static get OCEANIC_RIFT () { return BOUNDARIES.OCEANIC_RIFT.id }
    static get OROGENY () { return BOUNDARIES.OROGENY.id }
    static get OCEANIC_TRENCH () { return BOUNDARIES.OCEANIC_TRENCH.id }
    static get PASSIVE_MARGIN () { return BOUNDARIES.PASSIVE_MARGIN.id }
    static get ISLAND_ARC () { return BOUNDARIES.ISLAND_ARC.id }
    static get TRANSFORM_FAULT () { return BOUNDARIES.TRANSFORM_FAULT.id }
    static get OCEANIC_FAULT () { return BOUNDARIES.OCEANIC_FAULT.id }

    static getName(id) {
        return BOUNDARY_MAP.get(id).name
    }

    static getColor(id, defaultColor) {
        if (id !== Boundary.NONE) {
            return Color.fromHex(BOUNDARY_MAP.get(id).color)
        }
        return defaultColor
    }

    static isVisible(id) {
        return BOUNDARY_MAP.get(id).visible
    }

    static hasEdge(id) {

        return defaultColor
    }
}

