import { Matrix } from '/lib/base/matrix'
import { FloodFill, MultiFill, FloodFillConfig } from '/lib/floodfill'
import { LANDFORMS, Landform } from './landform'


const EMPTY = null


export class ErosionModel {
    constructor(reGroupTileMap, plateModel) {
        const {width, height} = reGroupTileMap

        this.plateModel = plateModel
        this.landformRegionsMap = new LandformRegionMap()
        this.erosionMatrix = new Matrix(width, height, () => EMPTY)
        this.landformMatrix = new Matrix(width, height, point => {
            const landform = plateModel.getLandformByPoint(point)
            const region = reGroupTileMap.getRegion(point)
            if (point.equals(region.origin)) {
                this.landformRegionsMap.add(landform, region)
            }
            return landform
        })
        // this._buildErosionMap()
    }

    _buildErosionMap() {
        const regions = this.landformRegionsMap.get(LANDFORMS.PEAK)
        const fills = regions.map(region => {
            const fillConfig = new ErosionFillConfig({
                reGroupTileMap: this.reGroupTileMap,
                erosionMatrix: this.erosionMatrix,
                landformMatrix: this.landformMatrix
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
        this.erosionMatrix = data.erosionMatrix
        this.landformMatrix = data.landformMatrix
        this.landform = data.landform  // origin's landform
    }

    getNeighbors(centerPoint) {
        const adjacents = centerPoint.adjacents()
        const centerLandform = this.landformMatrix.get(centerPoint)
        let landform = centerLandform

        const debug = centerPoint.hash == '53,27' ? true : false

        // discover neighbor landforms
        // adjacents.forEach(sidePoint => {
        //     const sideLandform = this.landformMatrix.get(sidePoint)
        //     if (debug) {
        //         console.log(sideLandform);
        //     }
            // set erosion on those lesser than landform at centerPoint
            // if (centerLandform.height > sideLandform.height + 1) {
            //     const name = centerLandform.erodesTo
            //     const erodedLandform = LANDFORMS[name] ?? sideLandform
            // }
        // })
        // need to set here because it depends on neighbors
        // if (this.isEmpty(centerPoint)) {
        //     this.erosionMatrix.set(centerPoint, landform)
        // }
        return adjacents
    }

    isEmpty(point) {
        return this.erosionMatrix.get(point) === EMPTY
    }
}


class LandformRegionMap {
    // must be
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
