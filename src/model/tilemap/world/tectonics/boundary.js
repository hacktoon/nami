import { Color } from '/lib/base/color'
import { Direction } from '/lib/base/direction'


const NO_EDGE = 1
const ONLY_EDGE = 2


const BOUNDARIES = {
    NONE:              { id: 0, visible: false, color: '#000'   , border: 0},
    CONTINENTAL_RIFT:  { id: 1, visible: true, color: '#0f4d4f' , border: 0},
    OCEANIC_RIFT:      { id: 2, visible: false, color: '#42155f', border: 0},
    OROGENY:           { id: 3, visible: true, color: '#b7ad8f' , border: 0},
    EARLY_OROGENY:     { id: 4, visible: true, color: '#a38216' , border: 0},
    OCEANIC_TRENCH:    { id: 5, visible: true, color: '#001b36' , border: 0},
    OCEANIC_CANYON:    { id: 6, visible: true, color: '#003365' , border: 0},
    PASSIVE_MARGIN:    { id: 7, visible: true, color: '#07A'    , border: 0},
    ISLAND_ARC:        { id: 8, visible: true, color: '#3bd4c2' , border: 0},
    CONTINENTAL_FAULT: { id: 9, visible: false, color: '#9aae6d', border: 0},
    OCEANIC_FAULT:     { id: 10, visible: false, color: '#003f6c', border: 0},
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
    static get EARLY_OROGENY () { return BOUNDARIES.EARLY_OROGENY.id }
    static get OCEANIC_TRENCH () { return BOUNDARIES.OCEANIC_TRENCH.id }
    static get OCEANIC_CANYON () { return BOUNDARIES.OCEANIC_CANYON.id }
    static get PASSIVE_MARGIN () { return BOUNDARIES.PASSIVE_MARGIN.id }
    static get ISLAND_ARC () { return BOUNDARIES.ISLAND_ARC.id }
    static get CONTINENTAL_FAULT () { return BOUNDARIES.CONTINENTAL_FAULT.id }
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


export class BoundaryMap {
    constructor(plates, regionGroups) {
        this.plates = plates
        this.regionGroups= regionGroups
    }

    get(region, neighborRegion) {
        const rgrp = this.regionGroups
        const group = rgrp.getGroupByRegion(region)
        const neighborGroup = rgrp.getGroupByRegion(neighborRegion)
        return this.getGroupBoundary(group, neighborGroup)
    }

    getGroupBoundary(group, neighborGroup) {
        const rgrp = this.regionGroups
        const plate = this.plates.get(group.id)
        const otherPlate = this.plates.get(neighborGroup.id)
        const dirToNeighbor = rgrp.getGroupDirection(group, neighborGroup)
        const dirFromNeighbor = rgrp.getGroupDirection(neighborGroup, group)
        // calc the dot product for each plate direction to another
        const dotTo = Direction.dotProduct(plate.direction, dirToNeighbor)
        const dotFrom = Direction.dotProduct(otherPlate.direction, dirFromNeighbor)
        if (group.id == 9 && neighborGroup.id == 2) {
            console.log(dotTo, dotFrom)
        }
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
        return Boundary.PASSIVE_MARGIN
    }

    _buildConvergentBoundary(p1, p2) {
        if (p1.isContinental()) return Boundary.OROGENY
        if (p2.isContinental()) return Boundary.OCEANIC_TRENCH
        // both oceanic
        const heavier = p1.isHeavier(p2)
        return heavier ? Boundary.OCEANIC_TRENCH : Boundary.ISLAND_ARC
    }

    _buildSemiConvergentBoundary(p1, p2) {
        if (p1.isFaster(p2)) {
            if (p1.isContinental()) return Boundary.EARLY_OROGENY
            if (p1.isOceanic()) return Boundary.OCEANIC_TRENCH
        }
        return Boundary.PASSIVE_MARGIN
    }

    _buildDivergentBoundary(p1, p2) {
        if (p1.isContinental()) {
            if (p2.isContinental()) return Boundary.CONTINENTAL_RIFT
            return Boundary.PASSIVE_MARGIN
        }
        if (p2.isContinental()) return Boundary.PASSIVE_MARGIN
        return Boundary.OCEANIC_RIFT
    }

    _buildTransformBoundary(p1, p2) {
        if (p1.isContinental()) {
            if (p2.isContinental()) return Boundary.CONTINENTAL_FAULT
            return Boundary.PASSIVE_MARGIN
        }
        if (p2.isContinental()) return Boundary.OCEANIC_CANYON
        return Boundary.OCEANIC_FAULT
    }
}
