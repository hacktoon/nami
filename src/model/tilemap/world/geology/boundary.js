import { Color } from '/lib/base/color'
import { PairMap } from '/lib/base'
import { Direction } from '/lib/base/direction'


const BOUNDARIES = {
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

    static getColor(id) {
        return Color.fromHex(BOUNDARY_MAP.get(id).color)
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
        this.table = new BoundaryTable(BOUNDARY_TABLE)
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
        const boundary = this.table.get(p1, p2, dotTo, dotFrom)

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


const BD_LAND = 0
const BD_WATER = 100
const BD_CONVERGE = 16
const BD_TRANSFORM = 4
const BD_DIVERGE = 1
const IDMAP = {
    L: BD_LAND,
    W: BD_WATER,
    C: BD_CONVERGE,
    D: BD_DIVERGE,
    T: BD_TRANSFORM,
}


class Boundary2 {
    constructor(data) {
        this.name = data.name
        this.chance = data.chance
        this.energy = data.energy
        this.growth = data.growth
        this.height = data.height
        this.color = data.color
        this.border = data.border
    }
}


class BoundaryTable {
    constructor(table=BOUNDARY_TABLE) {
        this._table = new Map()
        table.map(row => {
            const chars = Array.from(row.id)
            const code = chars.map(ch => IDMAP[ch]).reduce((a, b) => a + b, 0)
            this._table.set(code, row)
        })
    }

    get(p1, p2, dotTo, dotFrom) {
        const type1 = this._getType(p1)
        const type2 = this._getType(p2)
        const dir1 = this._getDir(dotTo)
        const dir2 = this._getDir(dotFrom)
        const code = type1 + type2 + dir1 + dir2
        const row = this._table.get(code)
        const boundary = this._getBoundary(row, p1, p2, dir1, dir2)
        if (p1.id == 5 && p2.id == 7) {
            console.log(
                `${p1.id}=>${p2.id} [${dir1}] weight="${p1.weight}w/${p2.weight}w"`,
                `${row.id} color="${boundary.color}" chance="${boundary.chance}"`,
                `energy="${boundary.energy}"`,
            )
        }
        return boundary
    }

    _getType(plate) {
        return plate.isContinental() ? BD_LAND : BD_WATER
    }

    _getDir(dir) {
        if (dir === 0) return BD_TRANSFORM
        return dir > 0 ? BD_CONVERGE : BD_DIVERGE
    }

    _getBoundary(row, p1, p2, dir1, dir2) {
        const first = row.data[0]
        const second = row.data.length === 1 ? first : row.data[1]
        if (row.rule === 'weight') {
            return new Boundary2(p1.weight > p2.weight ? first : second)
        }
        return new Boundary2(dir1 > dir2 ? first : second)
    }
}


const BOUNDARY_TABLE = [
    // CONTINENTAL-CONTINENTAL ---------------------------
    {id: 'LLCC', name: 'Collision between continents', data: [
        {height: 100, border: '#EEEEEE', color: '#CCCCCC', energy: 3, chance: .5, growth: 3}
    ]},
    {id: 'LLCT', name: 'Early orogeny / sparse hills', rule: 'weight', data: [
        {height: 100, color: '#749750', energy: 1, chance: .5, growth: 2},
        {height: 100, color: '#9aae6d', energy: 1, chance: .5, growth: 2},
    ]},
    {id: 'LLCD', name: 'Early rift uplift / volcano field', data: [
        {height: 100, color: '#749750', energy: 1, chance: .5, growth: 2}
    ]},
    {id: 'LLTT', name: 'Transform Fault', data: [
        {height: 100, color: '#9aae6d', energy: 1, chance: .5, growth: 8}
    ]},
    {id: 'LLDT', name: 'Early continental rift / valley', data: [
        {height: 100, color: '#125a0e', energy: 1, chance: .5, growth: 8}
    ]},
    {id: 'LLDD', name: 'Continental rift / early sea', rule: 'weight', data: [
        {height: 100, color: '#125a0e', energy: 2, chance: .5, growth: 8},
        {height: 100, color: '#006699', energy: 1, chance: .5, growth: 8},
    ]},

    // CONTINENTAL-OCEANIC ---------------------------
    {id: 'LWCC', name: 'Cordillera', rule: 'weight', data: [
        {height: 50, color: '#001b36', energy: 2, chance: .2, growth: 1}, //trench
        {height: 50, color: '#a79e86', energy: 2, chance: .6, growth: 1}, //mountains
    ]},
    {id: 'LWCT', name: 'Early cordillera', rule: 'weight', data: [
        {height: 50, color: '#001b36', energy: 2, chance: .6, growth: 1}, //trench
        {height: 50, color: '#a79e86', energy: 2, chance: .6, growth: 1}, //mountains
    ]},
    {id: 'LWCD', name: 'Early passive margin', rule: 'weight', data: [
        {height: 50, color: '#9aae6d', energy: 1, chance: .5, growth: 2},
        {height: 50, color: '#006699', energy: 1, chance: .5, growth: 8},
    ]},
    {id: 'LWTT', name: 'Coastal fault', rule: 'weight', data: [  // break regions
        {height: 50, color: '#006699', energy: 1, chance: .5, growth: 8},
        {height: 50, color: '#006699', energy: 1, chance: .5, growth: 8},
    ]},
    {id: 'LWDT', name: 'Early oceanic rift', rule: 'weight', data: [
        {height: 50, color: '#749750', energy: 1, chance: .5, growth: 2},
        {height: 50, color: '#006699', energy: 1, chance: .5, growth: 2}
    ]},
    {id: 'LWDD', name: 'Passive margin/Oceanic rift', rule: 'weight', data: [
        {height: 50, color: '#006699', energy: 1, chance: .5, growth: 2}
    ]},

    // OCEANIC-OCEANIC ---------------------------
    {id: 'WWCC', name: 'Island arc', rule: 'weight', data: [
        {height: 0, color: '#001b36', energy: 2, chance: .2, growth: 1}, //trench
        {height: 0, color: '#3bd4c2', energy: 1, chance: .5, growth: 2}, //arc
    ]},
    {id: 'WWCT', name: 'Early island arc', rule: 'weight', data: [
        {height: 0, color: '#001b36', energy: 2, chance: .6, growth: 1}, //trench
        {height: 0, color: '#003f6c', energy: 2, chance: .6, growth: 1}, //arc
    ]},
    {id: 'WWCD', name: 'Early continent', rule: 'weight', data: [
        {height: 0, color: '#003f6p', energy: 1, chance: .5, growth: 2},
        {height: 0, color: '#003f6l', energy: 1, chance: .5, growth: 2},
    ]},
    {id: 'WWTT', name: 'Oceanic fault', data: [
        {height: 0, color: '#003f6c', energy: 1, chance: .5, growth: 8,}
    ]},
    {id: 'WWDT', name: 'Early oceanic rift', data: [
        {height: 0, color: '#006699', energy: 1, chance: .5, growth: 2},
    ]},
    {id: 'WWDD', name: 'Oceanic rift', data: [
        {height: 0, color: '#006699', energy: 1, chance: .5, growth: 2,}
    ]},
]
