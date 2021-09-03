import { Matrix } from '/lib/base/matrix'
import { Graph } from '/lib/base/graph'
import { EvenPointSampling } from '/lib/base/point/sampling'
import { RegionMultiFill } from './fill'


const NO_REGION = null


export class RegionMapModel {
    constructor(params) {
        const [width, height, scale] = params.get('width', 'height', 'scale')
        this.origins = EvenPointSampling.create(width, height, scale)
        this.regionMatrix = new Matrix(width, height, () => NO_REGION)
        this.levelMatrix = new Matrix(width, height, () => 0)
        this.borderMatrix = new Matrix(width, height, () => new Set())
        this.chance = params.get('chance')
        this.growth = params.get('growth')
        this.graph = new Graph()
        this.areaTable = []
        new RegionMultiFill(this.origins, this)
    }
}
