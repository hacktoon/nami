import { Color } from '/lib/base/color'
import { PairMap } from '/lib/base'
import { Direction } from '/lib/base/direction'


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


const BOUNDARY_TABLE = [
    // CONTINENTAL-CONTINENTAL ---------------------------
    {id: 'LLCC', name: 'Collision between continents', data: [
        {height: 100, border: '#EEE', color: '#CCC', energy: 3, chance: .5, growth: 2}
    ]},
    {id: 'LLCT', name: 'Early orogeny / sparse hills', rule: 'weight', data: [
        {height: 100, color: '#749750', energy: 1, chance: .1, growth: 6},
        {height: 100, color: '#9aae6d', energy: 1, chance: .4, growth: 3},
    ]},
    {id: 'LLCD', name: 'Early rift', data: [
        {height: 100, border: '#058', color: '#058', energy: 4, chance: .5, growth: 8},
        {height: 100, border: '#0b7005', color: '#0b7005', energy: 3, chance: .5, growth: 10},
    ]},
    {id: 'LLTT', name: 'Transform Fault', data: [
        {height: 100, color: '#9aae6d', energy: 1, chance: .5, growth: 8}
    ]},
    {id: 'LLDT', name: 'Medium continental rift / valley', data: [
        {height: 100, border: '#058', color: '#069', energy: 3, chance: .5, growth: 3},
        {height: 100, border: '#058', color: '#069', energy: 3, chance: .5, growth: 3},
    ]},
    {id: 'LLDD', name: 'Continental rift / early sea', rule: 'weight', data: [
        {height: 100, border: '#058', color: '#069', energy: 5, chance: .5, growth: 5},
        {height: 100, border: '#058', color: '#069', energy: 5, chance: .5, growth: 5},
    ]},

    // CONTINENTAL-OCEANIC ---------------------------
    {id: 'LWCC', name: 'Cordillera', rule: 'weight', data: [
        {height: 50, color: '#025', energy: 2, chance: .2, growth: 1}, //trench
        {height: 50, color: '#a79e86', energy: 2, chance: .6, growth: 1}, //mountains
    ]},
    {id: 'LWCT', name: 'Early cordillera', rule: 'weight', data: [
        {height: 50, color: '#036', energy: 1, chance: .1, growth: 5}, //trench
        {height: 50, color: '#a4ce84', energy: 1, chance: .1, growth: 10}, //mountains
    ]},
    {id: 'LWCD', name: 'Early passive margin', rule: 'weight', data: [
        {height: 50, color: '#069', energy: 1, chance: .5, growth: 8},
        {height: 50, border: '#058', color: '#069', energy: 1, chance: .5, growth: 2},
    ]},
    {id: 'LWTT', name: 'Coastal fault', rule: 'weight', data: [  // break regions
        {height: 50, color: '#069', energy: 1, chance: .5, growth: 8},
        {height: 50, border: '#069', color: '#069', energy: 1, chance: .5, growth: 8},
    ]},
    {id: 'LWDT', name: 'Early oceanic rift', rule: 'weight', data: [
        {height: 50, color: '#069', energy: 1, chance: .5, growth: 2},
        {height: 50, color: '#749750', energy: 1, chance: .5, growth: 2},
    ]},
    {id: 'LWDD', name: 'Passive margin/Oceanic rift', rule: 'weight', data: [
        {height: 50, border: '#069', color: '#069', energy: 1, chance: .5, growth: 2}
    ]},

    // OCEANIC-OCEANIC ---------------------------
    {id: 'WWCC', name: 'Island arc', rule: 'weight', data: [
        {height: 0, color: '#025', energy: 1, chance: .5, growth: 2}, //trench
        {height: 0, color: '#26a11f', energy: 2, chance: .5, growth: 2}, //arc
    ]},
    {id: 'WWCT', name: 'Early island arc', rule: 'weight', data: [
        {height: 0, color: '#025', energy: 1, chance: .5, growth: 3}, //trench
        {height: 0, color: '#26a11f', energy: 1, chance: .5, growth: 5}, //arc
    ]},
    {id: 'WWCD', name: 'Early continent', rule: 'weight', data: [
        {height: 0, border: '#058', color: '#069', energy: 2, chance: .5, growth: 8},
        {height: 0, border: '#069', color: '#26a11f', energy: 2, chance: .5, growth: 8},
    ]},
    {id: 'WWTT', name: 'Oceanic fault', data: [
        {height: 0, color: '#003f6c', energy: 1, chance: .5, growth: 8,}
    ]},
    {id: 'WWDT', name: 'Early oceanic rift', data: [
        {height: 0, color: '#069', energy: 1, chance: .5, growth: 2},
    ]},
    {id: 'WWDD', name: 'Oceanic rift', data: [
        {height: 0, color: '#047', energy: 1, chance: .1, growth: 8}
    ]},
]


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
        return this.table.get(plate, otherPlate, dotTo, dotFrom)
    }

    get(region, neighborRegion) {
        const rgrp = this.regionGroupTileMap
        const group = rgrp.getGroupByRegion(region)
        const neighborGroup = rgrp.getGroupByRegion(neighborRegion)
        return this._boundaries.get(group.id, neighborGroup.id)
    }
}


class Boundary {
    constructor(id, name, data) {
        this.id = id
        this.name = name
        this.chance = data.chance
        this.energy = data.energy
        this.growth = data.growth
        this.height = data.height
        this.color = data.color
        this.border = data.border ?? null
    }

    hasBorder() {
        return Boolean(this.border)
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
        // if (p1.id == 5 && p2.id == 7) {
        //     console.log(
        //         `${p1.id}=>${p2.id} [${dir1}] weight="${p1.weight}w/${p2.weight}w"`,
        //         `${row.id} color="${boundary.color}" chance="${boundary.chance}"`,
        //         `energy="${boundary.energy}"`,
        //     )
        // }
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
        const name = row.name
        const id = row.id
        const first = row.data[0]
        const second = row.data.length === 1 ? first : row.data[1]
        let data
        if (row.rule === 'weight') {
            data = p1.weight > p2.weight ? first : second
        } else {
            data = dir1 > dir2 ? first : second
        }
        return new Boundary(id, name, data)
    }
}
