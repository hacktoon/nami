import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { ScanlineFill } from '../../lib/flood-fill'
import { Name } from '../../lib/name'

const MIN_CONTINENT_AREA_CHANCE = 8
const MIN_ISLAND_AREA_CHANCE = 1

const EMPTY_VALUE = 0
const CONTINENT = 0
const ISLAND = 1

const LANDMASS_TABLE = {
    [CONTINENT]: {color: "#0c2e63"},
    [ISLAND]: {color: "#8bddd4"},
}


export class LandmassMap {
    constructor(size, reliefMap) {
        this.grid = new Grid(size, size, EMPTY_VALUE)
        this.reliefMap = reliefMap
        this.size = size
        this.nextId = 1
        this.map = {}

        this._detectFeatures()
    }

    _detectFeatures() {
        this.grid.forEach((_, point) => {
            this._detect(point)
        })
    }

    get(point) {
        let id = this.grid.get(point)
        return this.map[id]
    }

    _detect(startPoint) {
        let tileCount = 0
        const isFillable = point => {
            let relief = this.reliefMap.get(point)
            let isEmpty = this.grid.get(point) == EMPTY_VALUE
            return relief.isLand && isEmpty
        }
        const onFill = point => {
            this.grid.set(point, this.nextId)
            tileCount++
        }

        if (isFillable(startPoint)) {
            new ScanlineFill(this.grid, startPoint, onFill, isFillable).fill()
            this._buildLandmass(this.nextId++, startPoint, tileCount)
        }
    }

    _buildLandmass(id, point, tileCount) {
        if (tileCount == 0) return

        let name = Name.createLandmassName()
        let type = ISLAND

        if (this._isContinentType(tileCount)) {
            type = CONTINENT
        } else if (this._isIslandType(tileCount)) {
            type = ISLAND
        }
        this.map[id] = new Landmass(id, type, name, point, tileCount)
    }

    _isContinentType(tileCount) {
        let totalTiles = Math.pow(this.size, 2)
        let tilePercentage = (100 * tileCount) / totalTiles
        return tilePercentage >= MIN_CONTINENT_AREA_CHANCE
    }

    _isIslandType(tileCount) {
        let totalTiles = Math.pow(this.size, 2)
        let tilePercentage = (100 * tileCount) / totalTiles
        let withinPercentage = tilePercentage >= MIN_ISLAND_AREA_CHANCE
        return !this._isContinentType(tileCount) && withinPercentage
    }
}


class Landmass {
    constructor(id, type, name, point, area) {
        this.id = id
        this.type = type
        this.name = name
        this.point = point
        this.area = area
    }

    get color() { return LANDMASS_TABLE[this.type].color }
    get isContinent() { return this.type == CONTINENT }
    get isIsland() { return this.type == ISLAND }
}
