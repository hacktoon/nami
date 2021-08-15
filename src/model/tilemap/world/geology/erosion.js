import { Matrix } from '/lib/base/matrix'
import { FloodFill, MultiFill, FloodFillConfig } from '/lib/floodfill'
import { LANDFORMS, Landform } from './landform'


const EMPTY = null


export class ErosionModel {
    constructor(reGroupTileMap, plateModel) {
        const {width, height} = reGroupTileMap
        this.reGroupTileMap = reGroupTileMap
        this.plateModel = plateModel
        this.landformRegions = this._buildLandformRegions()
        this.landformMatrix = new Matrix(width, height, point => {
            return plateModel.getLandformByPoint(point)
        })
        this._buildErosionMap()
    }

    _buildLandformRegions() {
        const landformRegions = new LandformRegions()
        this.reGroupTileMap.getRegions().forEach(region => {
            const landform = this.plateModel.getLandform(region.id)
            landformRegions.add(landform, region)
        })
        return landformRegions
    }

    _buildErosionMap() {
        const regions = this.landformRegions.get(LANDFORMS.PEAK)
        const fills = regions.map(region => {
            const landform = this.plateModel.getLandform(region.id)
            const fillConfig = new ErosionFillConfig({
                reGroupTileMap: this.reGroupTileMap,
                landformMatrix: this.landformMatrix,
                landform
            })
            return new FloodFill(region.origin, fillConfig)
        })
        new MultiFill(fills)
    }

    get(point) {
        return this.landformMatrix.get(point)
    }

}


class ErosionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.reGroupTileMap = data.reGroupTileMap
        this.landformMatrix = data.landformMatrix
        this.landform = data.landform
    }

    isEmpty(point) {
        return this.landformMatrix.get(point) === EMPTY
    }

    getNeighbors(centerPoint) {
        const sidePoints = centerPoint.adjacents()
        const debug = centerPoint.hash == '52,27' ? true : false
        return sidePoints.filter(sidePoint => {
            const centerLandform = this.landformMatrix.get(centerPoint)
            const sideLandform = this.landformMatrix.get(sidePoint)

            // set erosion on those lesser than landform at centerPoint
            if (sideLandform.height + 1 < centerLandform.height) {
                const name = centerLandform.erodesTo
                const erodedLandform = LANDFORMS[name] ?? sideLandform
                this.landformMatrix.set(sidePoint, erodedLandform)
            }
            // seed only those at same height
            return sideLandform.name === centerLandform.name
        })
    }
}


class LandformRegions {
    // for each landform.height, add all region.id in that height to a list
    constructor() {
        this.map = new Map()
    }

    add(landform, region) {
        if (! this.map.has(landform.name)) {
            this.map.set(landform.name, [])
        }
        const regions = this.map.get(landform.name)
        regions.push(region)
    }

    get(landform) {
        if (! this.map.has(landform.name)) {
            return []
        }
        return this.map.get(landform.name)
    }
}
