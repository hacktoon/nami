import { Color } from '/lib/base/color'
import { PairMap } from '/lib/base'
import { Direction } from '/lib/base/direction'


const BOUNDARIES = {
    NONE: {
        id: 0,  color: '#000000', border: 1,  energy: 0, chance: 0, growth: 0,
        land: true, borderColor: '#000',
    },
    CONTINENTAL_RIFT: {
        id: 1,  color: '#125a0e', border: 0, energy: 1, chance: .5, growth: 8,
        land: true, borderColor: '#000',
    },
    OCEANIC_RIFT: {
        id: 2,  color: '#006699', border: 0, energy: 1, chance: .5, growth: 2,
        land: false, borderColor: '#ff0000',
    },
    COLLISION_OROGENY: {
        id: 4,  color: '#CCCCCC', border: 1,  energy: 3, chance: .5, growth: 3,
        land: true, borderColor: '#EEE',
    },
    SUBDUCTION_OROGENY: {
        id: 3,  color: '#a79e86', border: 0, energy: 2, chance: .6, growth: 1,
        land: true, borderColor: '#CCC',
    },
    EARLY_OROGENY: {
        id: 5,  color: '#749750', border: 0, energy: 1, chance: .5, growth: 2,
        land: true, borderColor: '#CCC',
    },
    OCEANIC_TRENCH: {
        id: 6,  color: '#001b36', border: 0, energy: 2, chance: .2, growth: 1,
        land: false, borderColor: '#000',
    },
    ABYSSAL_PLAIN: {
        id: 7,  color: '#003365', border: 0, energy: 8, chance: .5, growth: 4,
        land: false, borderColor: '#000',
    },
    ISLAND_ARC: {
        id: 8,  color: '#3bd4c2', border: 0, energy: 1, chance: .5, growth: 1,
        land: true, borderColor: '#000',
    },
    CONTINENTAL_FAULT: {
        id: 9,  color: '#9aae6d', border: 0, energy: 1, chance: .5, growth: 8,
        land: true, borderColor: '#000',
    },
    OCEANIC_FAULT: {
        id: 10, color: '#003f6c', border: 0, energy: 1, chance: .5, growth: 8,
        land: false, borderColor: '#000',
    },
    EARLY_OCEAN: {
        id: 11, color: '#0b86bb', border: 1,  energy: 2, chance: .4, growth: 5,
        land: false, borderColor: '#ff0000',
    },
    PASSIVE_MARGIN: {
        id: 12, color: '#0077AA', border: 1,  energy: 5, chance: .5, growth: 6,
        land: false, borderColor: '#ff0000',
    },
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
    static get SUBDUCTION_OROGENY () { return BOUNDARIES.SUBDUCTION_OROGENY.id }
    static get COLLISION_OROGENY () { return BOUNDARIES.COLLISION_OROGENY.id }
    static get EARLY_OROGENY () { return BOUNDARIES.EARLY_OROGENY.id }
    static get OCEANIC_TRENCH () { return BOUNDARIES.OCEANIC_TRENCH.id }
    static get ABYSSAL_PLAIN () { return BOUNDARIES.ABYSSAL_PLAIN.id }
    static get ISLAND_ARC () { return BOUNDARIES.ISLAND_ARC.id }
    static get CONTINENTAL_FAULT () { return BOUNDARIES.CONTINENTAL_FAULT.id }
    static get OCEANIC_FAULT () { return BOUNDARIES.OCEANIC_FAULT.id }
    static get PASSIVE_MARGIN () { return BOUNDARIES.PASSIVE_MARGIN.id }
    static get EARLY_OCEAN () { return BOUNDARIES.EARLY_OCEAN.id }

    static getName(id) {
        return BOUNDARY_MAP.get(id).name
    }

    static getChance(id) {
        return BOUNDARY_MAP.get(id).chance
    }

    static getBorderColor(id) {
        return BOUNDARY_MAP.get(id).borderColor
    }

    static getGrowth(id) {
        return BOUNDARY_MAP.get(id).growth
    }

    static getEnergy(id) {
        return BOUNDARY_MAP.get(id).energy
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

    static isLand(id) {
        return BOUNDARY_MAP.get(id).land
    }

    static hasBorder(id) {
        return BOUNDARY_MAP.get(id).border === 1
    }
}


export class BoundaryMap {
    constructor(plates, regionGroupTileMap) {
        this.plates = plates
        this.regionGroupTileMap = regionGroupTileMap
        this._boundaries = new PairMap()

        regionGroupTileMap.getGroups().forEach(group => {
            const neighbors = regionGroupTileMap.getNeighborGroups(group)
            // console.log(`${group.id} = ${neighbors.map(g=>g.id).join(', ')}`);
            neighbors.forEach(neighbor => {
                const boundary = this._buildGroupBoundary(group, neighbor)
                this._boundaries.set(group.id, neighbor.id, boundary)
                // console.log(`${group.id}>${neighbor.id} = ${Boundary.getName(boundary)}`);
            })
        })
    }

    _buildGroupBoundary(group, neighborGroup) {
        const rgrp = this.regionGroupTileMap
        const plate = this.plates.get(group.id)
        const otherPlate = this.plates.get(neighborGroup.id)
        const dirToNeighbor = rgrp.getGroupDirection(group, neighborGroup)
        const dirFromNeighbor = rgrp.getGroupDirection(neighborGroup, group)
        const dotTo = Direction.dotProduct(plate.direction, dirToNeighbor)
        const dotFrom = Direction.dotProduct(otherPlate.direction, dirFromNeighbor)
        return this._buildBoundary(plate, otherPlate, dotTo, dotFrom)
    }

    _buildBoundary(p1, p2, dotTo, dotFrom) {
        if (dotTo > 0 && dotFrom > 0) {
            return this._buildConvergentBoundary(p1, p2)
        }
        if (dotTo < 0 && dotFrom < 0) {
            return this._buildDivergentBoundary(p1, p2)
        }
        if (dotTo == 0 && dotFrom == 0) {
            return this._buildTransformBoundary(p1, p2)
        }
        return this._buildOtherBoundary(p1, p2, dotTo, dotFrom)
    }

    _buildConvergentBoundary(p1, p2) {
        if (p1.isContinental()) {
            if (p2.isContinental()) return Boundary.COLLISION_OROGENY
            return Boundary.SUBDUCTION_OROGENY
        }
        if (p2.isContinental()) return Boundary.OCEANIC_TRENCH
        return p1.id > p2.id ? Boundary.ISLAND_ARC : Boundary.OCEANIC_TRENCH
    }

    _buildDivergentBoundary(p1, p2) {
        if (p1.isContinental()) {
            if (p2.isContinental()) return Boundary.CONTINENTAL_RIFT
            return Boundary.PASSIVE_MARGIN
        }
        if (p2.isContinental()) return Boundary.OCEANIC_RIFT
        return Boundary.OCEANIC_RIFT
    }

    _buildTransformBoundary(p1, p2) {
        if (p1.isContinental()) {
            if (p2.isContinental()) return Boundary.CONTINENTAL_FAULT
            return Boundary.CONTINENTAL_FAULT
        }
        if (p2.isContinental()) return Boundary.ABYSSAL_PLAIN
        return Boundary.OCEANIC_FAULT
    }

    _buildOtherBoundary(p1, p2, dotTo, dotFrom) {
        if (dotTo > 0) {
            if (p1.isContinental()) return Boundary.EARLY_OROGENY
            return Boundary.ABYSSAL_PLAIN
        }
        if (dotTo < 0) {
            if (p1.isContinental()) return Boundary.PASSIVE_MARGIN
            return Boundary.OCEANIC_RIFT
        }
        if (dotTo == 0) {
            if (p1.isContinental()) {
                if (p2.isContinental()) return Boundary.EARLY_OCEAN
                return Boundary.PASSIVE_MARGIN
            }
            return Boundary.OCEANIC_RIFT
        }
        if (dotFrom > 0) {
            if (p1.isContinental()) return Boundary.EARLY_OROGENY
            if (p2.isContinental()) return Boundary.OCEANIC_TRENCH
            if (p2.isOceanic()) return Boundary.ISLAND_ARC
            return Boundary.PASSIVE_MARGIN
        }
        if (dotFrom < 0) {
            if (p1.isContinental()) return Boundary.PASSIVE_MARGIN
            if (p2.isContinental()) return Boundary.OCEANIC_RIFT
            return Boundary.OCEANIC_RIFT
        }
        if (p1.isContinental()) return Boundary.PASSIVE_MARGIN
        return Boundary.ABYSSAL_PLAIN
    }

    get(region, neighborRegion) {
        const rgrp = this.regionGroupTileMap
        const group = rgrp.getGroupByRegion(region)
        const neighborGroup = rgrp.getGroupByRegion(neighborRegion)
        return this._boundaries.get(group.id, neighborGroup.id)
    }
}


const BOUNDARIES2 = {
    // CONTINENTAL-CONTINENTAL
    LLCC: {name: 'Collision between continents',
        color: '#CCC', borderColor: '#EEE', energy: 3, chance: .5, growth: 3,
    },
    LLCT: {name: 'Early collision, sparse hills',
        color: '#749750', energy: 1, chance: .5, growth: 2,
    },
    LLCD: {name: 'Early fault - uplift step',
        color: '#749750', energy: 1, chance: .5, growth: 2,
    },
    LLTT: {name: 'Fault',
        color: '#9aae6d', energy: 1, chance: .5, growth: 8,
    },
    LLTD: {name: 'Early continental rift',
        color: '#125a0e', energy: 1, chance: .5, growth: 8,
    },
    LLDD: {name: 'Continental rift',
        color: '#125a0e', energy: 1, chance: .5, growth: 8,
    },

    // CONTINENTAL-OCEANIC
    COCC: {name: 'Collision between continent and ocean',
        color: '#a79e86', border: 0, energy: 2, chance: .6, growth: 1,
        borderColor: '#CCC',
    },
    COCT: {name: '?',
        color: '#a79e86', border: 0, energy: 2, chance: .6, growth: 1,
        borderColor: '#CCC',
    },
    COCD: {name: '?',
        color: '#749750', border: 0, energy: 1, chance: .5, growth: 2,
        borderColor: '#CCC',
    },
    COTT: {name: 'Coastal fault',  //  break regions
        color: '#9aae6d', border: 0, energy: 1, chance: .5, growth: 8,
        borderColor: '#000',
    },
    COTD: {name: '?',
        color: '#749750', border: 0, energy: 1, chance: .5, growth: 2,
        borderColor: '#CCC',
    },
    CODD: {name: 'Oceanic rift, passive margin',
        color: '#749750', border: 0, energy: 1, chance: .5, growth: 2,
        borderColor: '#CCC',
    },

    // OCEANIC-OCEANIC
    OOCC: {name: 'Island arc',
        color: '#CCCCCC', energy: 3, chance: .5, growth: 3,
    },
    OOCT: {name: 'Sea mounts arc',
        color: '#a79e86', energy: 2, chance: .6, growth: 1,
    },
    OOCD: {name: 'Fault mountains',
        color: '#749750', energy: 1, chance: .5, growth: 2,
    },
    OOTT: {name: 'Oceanic fault',
        color: '#003f6c', energy: 1, chance: .5, growth: 8,
    },
    OOTD: {name: 'Early oceanic rift',
        color: '#749750', energy: 1, chance: .5, growth: 2,
    },
    OODD: {name: 'OCEANIC_RIFT',
        color: '#006699', energy: 1, chance: .5, growth: 2,
    },
}
