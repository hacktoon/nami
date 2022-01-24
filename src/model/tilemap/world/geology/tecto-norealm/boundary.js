import { PairMap } from '/lib/map'
import { Direction } from '/lib/direction'
import { Point } from '/lib/point'

import { TectonicsTable } from './table'


export class BoundaryModel {
    /*
        Reads the boundary table and build boundary data relative to plates.
        Converts boundary code like 'LLCT' to its numeric id, summing
        each character value.
    */

    #tectonicsTable
    #plateModel
    #boundaryMap

    constructor(regionTileMap, tectonicsTable, plateModel) {
        this.#plateModel = plateModel
        this.#tectonicsTable = tectonicsTable
        this.#boundaryMap = this._buildBoundaryMap(regionTileMap)
    }

    get(region, sideRegion) {
        return this.#boundaryMap.get(region, sideRegion)
    }

    _buildBoundaryMap(regionTileMap) {
        const boundaryMap = new PairMap()
        for(let region of regionTileMap.getRegions()) {
            const origin = regionTileMap.getOriginById(region)
            for(let sideRegion of regionTileMap.getSideRegions(region)) {
                let sideOrigin = regionTileMap.getOriginById(sideRegion)
                sideOrigin = regionTileMap.rect.unwrapFrom(origin, sideOrigin)
                const params = {region, sideRegion, origin, sideOrigin}
                const boundary = this._buildBoundary(params)
                boundaryMap.set(region, sideRegion, boundary)
            }
        }
        return boundaryMap
    }

    _buildBoundary({region, sideRegion, origin, sideOrigin}) {
        const dirToSide = this._getDirection(origin, sideOrigin)
        const dirFromSide = this._getDirection(sideOrigin, origin)
        const plateDir = this.#plateModel.getDirection(region)
        const sidePlateDir = this.#plateModel.getDirection(sideRegion)
        const isPlateOceanic = this.#plateModel.isOceanic(region)
        const isSidePlateOceanic = this.#plateModel.isOceanic(sideRegion)
        const dotTo = Direction.dotProduct(plateDir, dirToSide)
        const dotFrom = Direction.dotProduct(sidePlateDir, dirFromSide)
        const directionTo = this._parseDir(dotTo)
        const directionFrom = this._parseDir(dotFrom)
        const type1 = isPlateOceanic
            ? TectonicsTable.PLATE_OCEANIC
            : TectonicsTable.PLATE_CONTINENTAL
        const type2 = isSidePlateOceanic
            ? TectonicsTable.PLATE_OCEANIC
            : TectonicsTable.PLATE_CONTINENTAL
        const id = type1 + type2 + directionTo + directionFrom
        return this.#tectonicsTable.getBoundary(id)
    }

    _getDirection(origin, sideOrigin) {
        const angle = Point.angle(origin, sideOrigin)
        return Direction.fromAngle(angle)
    }

    _parseDir(dir) {
        if (dir === 0)
            return TectonicsTable.DIR_TRANSFORM
        return dir > 0 ? TectonicsTable.DIR_CONVERGE : TectonicsTable.DIR_DIVERGE
    }
}
