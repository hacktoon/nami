import { Matrix } from '/lib/base/matrix'
import { FloodFill, MultiFill, FloodFillConfig } from '/lib/floodfill'
import { LANDFORMS, Landform } from './landform'


const EMPTY = null


export class ErosionModel {
    constructor(reGroupTileMap, plateModel) {
        const {width, height} = reGroupTileMap

        // INPUT attributes
        this.reGroupTileMap = reGroupTileMap
        this.plateModel = plateModel

        // OUTPUT attributes
        // this.landformRegionsMap = this._buildLandformRegions()
        this.landformMatrix = new Matrix(width, height, point => {
            return plateModel.getLandformByPoint(point)
        })
        // this.erosionMatrix = new Matrix(width, height, () => EMPTY)
        // this._buildErosionMap()
    }

    // _buildLandformRegions() {
    //     const landformRegionsMap = new LandformRegionMap()
    //     this.reGroupTileMap.getRegions().forEach(region => {
    //         const landform = this.plateModel.getLandform(region.id)
    //         landformRegionsMap.add(landform, region)
    //     })
    //     return landformRegionsMap
    // }

    // _buildErosionMap() {
    //     const regions = this.landformRegionsMap.get(LANDFORMS.PEAK)
    //     const fills = regions.map(region => {
    //         const landform = this.plateModel.getLandform(region.id)
    //         const fillConfig = new ErosionFillConfig({
    //             reGroupTileMap: this.reGroupTileMap,
    //             erosionMatrix: this.erosionMatrix,
    //             plateModel: this.plateModel,
    //             landform
    //         })
    //         return new FloodFill(region.origin, fillConfig)
    //     })
    //     new MultiFill(fills)
    // }

    get(point) {
        return this.landformMatrix.get(point)
    }

}


class ErosionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.reGroupTileMap = data.reGroupTileMap
        this.erosionMatrix = data.erosionMatrix
        this.plateModel = data.plateModel
        this.landform = data.landform
    }

    setValue(point) {
        // set this.landform as default
        const landform = this.plateModel.getLandformByPoint(point)
        return this.erosionMatrix.set(point, landform)
    }

    isEmpty(point) {
        return this.erosionMatrix.get(point) === EMPTY
    }

    checkNeighbor(sidePoint, centerPoint) {
        const centerLandform = this.plateModel.getLandformByPoint(centerPoint)
        const sideLandform = this.plateModel.getLandformByPoint(sidePoint)
        const debug = centerPoint.hash == '128,39' ? true : false

        // set erosion on those lesser than landform at centerPoint
        if (centerLandform.height > sideLandform.height + 1) {
            const name = centerLandform.erodesTo
            const erodedLandform = LANDFORMS[name] ?? sideLandform
            // if (debug) {
            //     console.log(centerLandform.height, sideLandform.height, erodedLandform);
            // }

            // this.erosionMatrix.set(sidePoint, erodedLandform)
        }
    }

    getNeighbors(centerPoint) {
        const adjacents = centerPoint.adjacents()
        return adjacents
    }
}


class LandformRegionMap {
    // for each landform, add all region.id with that landform to a list
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
