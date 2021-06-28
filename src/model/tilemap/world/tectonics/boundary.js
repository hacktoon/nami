import { Color } from '/lib/base/color'
import { Direction } from '/lib/base/direction'


const BOUNDARIES = {
    NONE: {
        id: 0, visible: false, color: '#000'   , border: true, energy: 0},
    CONTINENTAL_RIFT: {
        id: 1, visible: false, color: '#125a0e' , border: false, energy: 1},
    OCEANIC_RIFT: {
        id: 2, visible: false, color: '#42155f', border: false, energy: 1},
    SUBDUCTION_OROGENY: {
        id: 3, visible: true, color: '#ccb672' , border: false, energy: 2},
    COLLISION_OROGENY: {
        id: 4, visible: true, color: '#dbd6c7' , border: true, energy: 3},
    EARLY_OROGENY: {
        id: 5, visible: true, color: '#749750' , border: false, energy: 1},
    OCEANIC_TRENCH: {
        id: 6, visible: true, color: '#001b36' , border: false, energy: 1},
    OCEANIC_VALLEY: {
        id: 7, visible: true, color: '#003365' , border: false, energy: 2},
    PASSIVE_MARGIN: {
        id: 8, visible: true, color: '#07A', border: true, energy: 3},
    ISLAND_ARC: {
        id: 9, visible: true, color: '#3bd4c2' , border: false, energy: 1},
    CONTINENTAL_FAULT: {
        id: 10, visible: false, color: '#9aae6d', border: false, energy: 1},
    OCEANIC_FAULT: {
        id: 11, visible: false, color: '#003f6c', border: false, energy: 1},
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
    static get OCEANIC_VALLEY () { return BOUNDARIES.OCEANIC_VALLEY.id }
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

    static hasBorder(id) {
        return BOUNDARY_MAP.get(id).border
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
        const plate = this.plates.get(group.id)
        const otherPlate = this.plates.get(neighborGroup.id)
        // const dirToNeighbor = rgrp.getGroupDirection(group, neighborGroup)
        // const dirFromNeighbor = rgrp.getGroupDirection(neighborGroup, group)
        const dirToNeighbor = rgrp.getRegionDirection(region, neighborRegion)
        const dirFromNeighbor = rgrp.getRegionDirection(neighborRegion, region)
        // calc the dot product for each plate direction to another
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
        if (p2.isContinental()) return Boundary.PASSIVE_MARGIN
        return Boundary.OCEANIC_RIFT
    }

    _buildTransformBoundary(p1, p2) {
        if (p1.isContinental()) {
            if (p2.isContinental()) return Boundary.CONTINENTAL_FAULT
            return Boundary.PASSIVE_MARGIN
        }
        if (p2.isContinental()) return Boundary.OCEANIC_VALLEY
        return Boundary.OCEANIC_FAULT
    }

    _buildOtherBoundary(p1, p2, dotTo, dotFrom) {
        if (dotTo > 0) {
            if (p1.isContinental()) return Boundary.EARLY_OROGENY
            return Boundary.OCEANIC_VALLEY
        }
        if (dotTo < 0) {
            if (p1.isContinental()) return Boundary.PASSIVE_MARGIN
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
            if (p2.isOceanic()) return Boundary.OCEANIC_RIFT
        }
        return Boundary.PASSIVE_MARGIN
    }
}



// const BOUNDARIES2 = {
//     LLCC: {id: 0, name: 'COLLISION SUBDUCTION_OROGENY',
//         color: '#d9cfaf', border: 0,
//     },
//     LWCC: {id: 1, name: 'SUBDUCTION SUBDUCTION_OROGENY',
//         color: '#b7ad8f', border: 0,
//     },

// }

