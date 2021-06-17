import { Color } from '/lib/base/color'


const BOUNDARIES = {
    NONE:             {id: 0, color: '#000'},
    CONTINENTAL_RIFT: {id: 1, color: '#176113'},
    OCEANIC_RIFT:     {id: 2, color: '#42155f'},
    OROGENY:          {id: 3, color: '#a38216'},
    OCEANIC_TRENCH:   {id: 4, color: '#001b36'},
    PASSIVE_MARGIN:   {id: 5, color: '#07A'},
    ISLAND_ARC:       {id: 6, color: '#3bd4c2'},
    TRANSFORM_FAULT:  {id: 7, color: '#9aae6d'},
    OCEANIC_FAULT:    {id: 8, color: '#003f6c'},
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

    static hasEdge(id) {

        return defaultColor
    }
}

