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
        this._buildErosionMap()
    }

    _buildHeightIndex() {
        const index = new HeightIndex()
        this.reGroupTileMap.getRegions().forEach(region => {
            const landform = this.plateModel.getLandform(region.id)
            index.add(landform, region)
        })
        return index
    }

    _buildErosionMap() {
        const regions = this.heightIndex.get(LANDFORMS.PEAK)
        const fills = regions.map(region => {
            const fillConfig = new RegionFillConfig({
                reGroupTileMap: this.reGroupTileMap,
                matrix: this.landformMatrix,
                region
            })
            return new FloodFill(region.origin, fillConfig)
        })
        new MultiFill(fills)
    }

}


class RegionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.reGroupTileMap = data.reGroupTileMap
        this.landformMatrix = data.matrix
        this.region = data.region
    }

    isEmpty(point) {
        return this.landformMatrix.get(point) === EMPTY
    }

    setValue(point, level) {
        this.landformMatrix.set(point, 'xpto')
    }

    getNeighbors(point) {
        const region = this.reGroupTileMap.getRegion(point)
        const neighbors = point.adjacents()
        if (region.id == 4225) {
            console.log(point.hash, neighbors.map(p => p.hash));
        }
        return neighbors
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
