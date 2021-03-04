import { Color } from '/lib/base/color'
import { Matrix } from '/lib/base/matrix'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'


const NO_REGION = null
const NO_BORDER = null


export class Regions {
    constructor(origins, params) {
        const [width, height] = params.get('width', 'height')
        this.regionList = []
        this.regionMap = new Map()
        this.matrix = new RegionMatrix(width, height)
        this.origins = origins

        const fills = origins.map((origin, id) => {
            const region = new Region(id, origin)
            const fillConfig = new RegionFillConfig(this.matrix, region, params)
            this.regionList.push(region)
            this.regionMap.set(id, region)
            return new OrganicFloodFill(origin, fillConfig)
        })
        new MultiFill(fills).fill()
    }

    getRegion(point) {
        const id = this.matrix.getRegionId(point)
        return this.regionMap.get(id)
    }

    getBorderRegion(point) {
        const id = this.matrix.getBorderId(point)
        return this.regionMap.get(id)
    }

    isBorder(point) {
        return this.matrix.isBorder(point)
    }

    forEach(callback) {
        this.regionList.forEach(callback)
    }

    map(callback) {
        return this.regionList.map(callback)
    }
}


class Region {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
        this.area = 0
        this.color = new Color()
    }
}


class RegionMatrix {
    constructor(width, height) {
        this.regionIdMatrix = new Matrix(width, height, () => NO_REGION)
        this.borderMatrix = new Matrix(width, height, () => NO_BORDER)
    }

    isEmpty(point) {
        return this.regionIdMatrix.get(point) === NO_REGION
    }

    isBorder(point) {
        return this.borderMatrix.get(point) !== NO_BORDER
    }

    setRegion(point, id) {
        return this.regionIdMatrix.set(point, id)
    }

    setBorder(point, id) {
        return this.borderMatrix.set(point, id)
    }

    getRegionId(point) {
        return this.regionIdMatrix.get(point)
    }

    getBorderId(point) {
        return this.borderMatrix.get(point)
    }
}


class RegionFillConfig {
    constructor(matrix, currentRegion, params) {
        this.currentRegion = currentRegion
        this.chance = params.get('chance')
        this.growth = params.get('growth')
        this.matrix = matrix
    }

    isEmpty(point) {
        return this.matrix.isEmpty(point)
    }

    setValue(point) {
        this.matrix.setRegion(point, this.currentRegion.id)
        this.currentRegion.area += 1
    }

    checkNeighbor(neighbor, origin) {
        const neighborId = this.matrix.getRegionId(neighbor)
        if (neighborId === NO_REGION) return
        if (neighborId === this.currentRegion.id) return
        this.matrix.setBorder(origin, neighborId)
    }
}