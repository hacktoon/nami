import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { ScanlineFill } from '../../lib/flood-fill'
import { Name } from '../../lib/name'

const MIN_CONTINENT_AREA_CHANCE = 4

const EMPTY_VALUE = 0
const CONTINENT = 0
const ISLAND = 1

const LANDMASS_TABLE = {
    [CONTINENT]: { color: "#0f7100", name: "Continent"},
    [ISLAND]: { color: "#00ff00", name: "Island"},
}


export class LandmassMap {
    constructor(reliefMap, waterbodyMap) {
        this.size = reliefMap.size
        this.grid = new Grid(this.size, this.size, {id: EMPTY_VALUE, isLitoral: false})
        this.reliefMap = reliefMap
        this.waterbodyMap = waterbodyMap
        this.nextId = 1
        this.map = {}
        this.litoralPoints = []

        this._detectLandmasses()
    }

    _detectLandmasses() {
        this.reliefMap.landPoints.forEach(point => this._detect(point))
    }

    _detect(startPoint) {
        let tileCount = 0
        const isFillable = point => {
            let relief = this.reliefMap.get(point)
            let isEmpty = this.grid.get(point).id == EMPTY_VALUE
            return relief.isLand && isEmpty
        }
        const onFill = point => {
            this.grid.set(point, {
                id: this.nextId,
                isLitoral: detectLitoral(point)
            })
            tileCount++
        }
        const detectLitoral = point => {
            let isLitoral = false
            point.adjacentPoints(neighbor => {
                const waterbody = this.waterbodyMap.get(neighbor)
                if (waterbody && (waterbody.isOcean || waterbody.isSea)) {
                    isLitoral = true
                    this.litoralPoints.push(point)
                }
            })
            return isLitoral
        }

        if (isFillable(startPoint)) {
            new ScanlineFill(this.grid, startPoint, onFill, isFillable).fill()
            this._buildLandmass(this.nextId++, startPoint, tileCount)
        }
    }

    _buildLandmass(id, point, tileCount) {
        if (tileCount == 0) return
        let type = this._isContinent(tileCount) ? CONTINENT : ISLAND
        this.map[id] = new Landmass(id, type, point, tileCount)
    }

    _isContinent(tileCount) {
        let totalTiles = Math.pow(this.size, 2)
        let tilePercentage = (100 * tileCount) / totalTiles
        return tilePercentage >= MIN_CONTINENT_AREA_CHANCE
    }

    get(point) {
        let id = this.grid.get(point).id
        return this.map[id]
    }

    isLitoral(point) {
        return this.grid.get(point).isLitoral
    }
}


class Landmass {
    constructor(id, type, point, area) {
        this.id = id
        this.type = type
        this._name = Name.createLandmassName()
        this.point = point
        this.area = area
    }

    get name() {
        const type_name = LANDMASS_TABLE[this.type].name
        return `${this._name} ${type_name}`
    }
    get color() { return LANDMASS_TABLE[this.type].color }
    get isContinent() { return this.type == CONTINENT }
    get isIsland() { return this.type == ISLAND }
}
