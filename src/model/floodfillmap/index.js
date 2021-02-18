import { Schema, Type } from '/lib/base/schema'
import { OrganicMultiFill } from '/lib/floodfill/organic'
import { Matrix } from '/lib/base/matrix'
import { RandomPointSampling, EvenPointSampling } from '/lib/base/point/sampling'
import { BaseMap } from '/model/lib/map'
import { MapDiagram } from './diagram'
import { MapUI } from '/lib/ui/map'


const SAMPLING_ENTRIES = [
    RandomPointSampling,
    EvenPointSampling,
]
const SAMPLING_MAP = new Map(SAMPLING_ENTRIES.map(model => [model.name, model]))

const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 256}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 256}),
    Type.number('scale', 'Scale', {default: 20, step: 1, min: 1}),
    Type.number('growth', 'Growth', {default: 10, step: 1, min: 0}),
    Type.number('chance', 'Chance', {default: 0.3, step: 0.01, min: 0.1, max: 1}),
    // Type.enum('pointSampling', 'Sampling', {
    //     default: EvenPointSampling.name,
    //     options: SAMPLING_ENTRIES
    // }),
    Type.text('seed', 'Seed', '')
)


export default class FloodFillMap extends BaseMap {
    static label = 'FloodFill map'
    static diagram = MapDiagram
    static schema = SCHEMA
    static ui = MapUI

    static create(params) {
        return new FloodFillMap(params)
    }

    constructor(params) {
        super(params)

        const PointSampling = RandomPointSampling//SAMPLING_MAP.get(params.get('pointSampling'))
        const points = PointSampling.create(
            params.get('scale'), this.width, this.height
        )
        this.matrix = new Matrix(this.width, this.height, () => 0)
        const multiFill = new OrganicMultiFill(points, value => ({
            chance:     params.get('chance'),
            isEmpty:    point => this.matrix.get(point) === 0,
            setValue:   point => this.matrix.set(point, value),
            growth: params.get('growth'),
        }))
        this.regionCount = multiFill.size
    }

    get(point) {
        return this.matrix.get(point)
    }
}