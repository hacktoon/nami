import { Matrix } from '/lib/base/matrix'
import { FloodFill, MultiFill, FloodFillConfig } from '/lib/floodfill'
import { LANDFORMS } from './landform'


const EMPTY = null


export class ErosionModel {
    constructor(reGroupTileMap, plateModel) {
        const {width, height} = reGroupTileMap
        this.reGroupTileMap = reGroupTileMap
        this.plateModel = plateModel
        this.heightIndex = this._buildHeightIndex()
        this.landformMatrix = new Matrix(width, height, () => EMPTY)
        this._erodePeaks()
    }

    _buildHeightIndex() {
        const index = new HeightIndex()
        this.reGroupTileMap.getRegions().forEach(region => {
            const landform = this.plateModel.getLandform(region.id)
            index.add(landform, region)
        })
        return index
    }

    _erodePeaks() {
        const regions = this.heightIndex.get(LANDFORMS.PEAK)
        const fills = regions.map(region => {
            const fillConfig = new RegionFillConfig({
                reGroupTileMap: this.reGroupTileMap,
                matrix: this.landformMatrix,
            })
            return new FloodFill(region, fillConfig)
        })
        new MultiFill(fills)
    }

}


class RegionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.reGroupTileMap = data.reGroupTileMap
        this.landformMatrix = data.matrix
    }

    isEmpty(region) {
        return this.landformMatrix.get(region.id) === EMPTY
    }

    setValue(region, level) {
        this.landformMatrix.set(region.id, level)
    }

    getNeighbors(region) {
        // if (region.id == 4225){
        //     console.log(this.reGroupTileMap.getNeighborRegions(region));
        // }
        const neighbors = this.reGroupTileMap.getNeighborRegions(region)
        return neighbors.filter(region => {
            return region
        })
    }
}



class HeightIndex {
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
