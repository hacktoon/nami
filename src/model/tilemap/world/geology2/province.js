import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'
import { Point } from '/lib/point'
import { PointSet } from '/lib/point/set'
import { Matrix } from '/lib/matrix'

const NO_PROVINCE = null


export class ProvinceModel {
    #provinceMatrix

    constructor(regionTileMap, boundaryModel) {
        // get border points
        // create pointQueue for border points
        // create corner provinces for points with two neighbors
        // create rest of provinces from points in borders
    }


}


class ProvinceConcurrentFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, ProvinceFloodFill, context)
    }
    getChance(fill, origin) { return .5 }
    getGrowth(fill, origin) { return 4 }
}


class ProvinceFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        const maxLevelMap = fill.context.maxLevelMap
        const id = fill.context.provinceIdList[fill.id]
        fill.context.provinceMatrix.set(point, id)
        fill.context.levelMatrix.set(point, level)
        // updates max level to use on % of feature calc
        if (level > maxLevelMap.get(id)) {
            maxLevelMap.set(id, level)
        }
    }

    isEmpty(fill, point) {
        return fill.context.provinceMatrix.get(point) === NO_PROVINCE
    }

    getNeighbors(fill, originPoint) {
        return Point.adjacents(originPoint)
    }
}
