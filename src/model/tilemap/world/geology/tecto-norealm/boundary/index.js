import { PairMap } from '/lib/map'
import { Direction } from '/lib/direction'
import { Point } from '/lib/point'

import { BOUNDARY_TABLE } from './table'


const PLATE_CONTINENTAL = 0
const PLATE_OCEANIC = 100
const DIR_CONVERGE = 1
const DIR_TRANSFORM = 4
const DIR_DIVERGE = 16
const INT_MAP = {
    L: PLATE_CONTINENTAL,
    W: PLATE_OCEANIC,
    C: DIR_CONVERGE,
    D: DIR_DIVERGE,
    T: DIR_TRANSFORM,
}


export class BoundaryModel {
    /*
        Reads the boundary table and translates to province.
        Converts boundary code like 'LLCT' to its numeric id, summing
        each character value.
    */

    #specMap
    #plateModel
    #boundaryMap

    constructor(regionTileMap, plateModel) {
        this.#plateModel = plateModel
        this.#specMap = this._buildSpecMap()
        this.#boundaryMap = this._buildBoundaryMap(regionTileMap)
    }

    get(region, sideRegion) {
        return this.#boundaryMap.get(region, sideRegion)
    }

    _buildSpecMap() {
        const map = new Map()
        // convert the boundary key to a sum of its char int codes
        // Ex: LLCC = 0011 = 0 + 0 + 1 + 1 = 2
        BOUNDARY_TABLE.map(row => {
            const ints = Array.from(row.key).map(ch => INT_MAP[ch])
            const id = ints.reduce((a, b) => a + b, 0)
            map.set(id, {...row, id})
        })
        return map
    }

    _buildBoundaryMap(regionTileMap) {
        // DirectionMap
        // Maps a region X and a region Y to a direction between them
        const pairMap = new PairMap()
        const {rect} = regionTileMap

        for(let region of regionTileMap.getRegions()) {
            const origin = regionTileMap.getOriginById(region)
            for(let sideRegion of regionTileMap.getSideRegions(region)) {
                const sideOrigin = regionTileMap.getOriginById(sideRegion)
                const unwrpdSideOrigin = rect.unwrapFrom(origin, sideOrigin)
                const boundary = this._buildBoundary(
                    region, sideRegion,
                    origin, unwrpdSideOrigin
                )
                pairMap.set(region, sideRegion, boundary)
            }
        }
        return pairMap
    }

    _buildBoundary(region, sideRegion, origin, sideOrigin) {
        const boundaryId = this._buildBoundaryId(
            region, sideRegion,
            origin, sideOrigin
        )
        const spec = this.#specMap.get(boundaryId)
        const heavier = spec.data[0]
        const lighter = spec.data.length === 1 ? heavier : spec.data[1]
        const realmWeight = this.#plateModel.getWeight(region)
        const neighborRealmWeight = this.#plateModel.getWeight(sideRegion)
        return realmWeight > neighborRealmWeight ? heavier : lighter
    }

    _buildBoundaryId(region, sideRegion, origin, sideOrigin) {
        const dirToSide = this._getDirection(origin, sideOrigin)
        const dirFromSide = this._getDirection(sideOrigin, origin)
        const plateDir = this.#plateModel.getDirection(region)
        const sidePlateDir = this.#plateModel.getDirection(sideRegion)
        const dotTo = Direction.dotProduct(plateDir, dirToSide)
        const dotFrom = Direction.dotProduct(sidePlateDir, dirFromSide)
        const directionTo = this._parseDir(dotTo)
        const directionFrom = this._parseDir(dotFrom)
        const isPlateOceanic = this.#plateModel.isOceanic(region)
        const isSidePlateOceanic = this.#plateModel.isOceanic(sideRegion)
        const type1 = isPlateOceanic ? PLATE_OCEANIC : PLATE_CONTINENTAL
        const type2 = isSidePlateOceanic ? PLATE_OCEANIC : PLATE_CONTINENTAL
        return type1 + type2 + directionTo + directionFrom
    }

    _getDirection(origin, sideOrigin) {
        const angle = Point.angle(origin, sideOrigin)
        return Direction.fromAngle(angle)
    }

    _parseDir(dir) {
        if (dir === 0) return DIR_TRANSFORM
        return dir > 0 ? DIR_CONVERGE : DIR_DIVERGE
    }
}
