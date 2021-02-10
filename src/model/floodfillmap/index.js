import { Schema, Type } from '/lib/schema'
import { OrganicMultiFill } from '/lib/floodfill/organic'
import { Grid } from '/lib/grid'
import { RandomPointSampling, EvenPointSampling } from '/lib/point/sampling'
import { BaseMap } from '/model/lib/map'
import { MapDiagram } from './diagram'


const SAMPLING_ENTRIES = [
    [RandomPointSampling.id, RandomPointSampling],
    [EvenPointSampling.id, EvenPointSampling],
]
const SAMPLING_MAP = new Map(SAMPLING_ENTRIES)


export default class FloodFillMap extends BaseMap {
    static id = 'FloodFillMap'

    static schema = new Schema(
        Type.number('width', 'Width', 150, {step: 1, min: 1, max: 256}),
        Type.number('height', 'Height', 100, {step: 1, min: 1, max: 256}),
        Type.number('scale', 'Scale', 20, {step: 1, min: 1}),
        Type.number('growth', 'Growth', 10, {step: 1, min: 0}),
        Type.number('chance', 'Chance', 0.3, {
            step: 0.01, min: 0.1, max: 1
        }),
        Type.enum('pointSampling', 'Sampling', EvenPointSampling.id, {
            options: SAMPLING_ENTRIES.map(([id,]) => [id, id])
        }),
        Type.text('seed', 'Seed', '')
    )
    static diagram = MapDiagram

    static create(params) {
        return new FloodFillMap(params)
    }

    constructor(params) {
        super(params)

        const pointSampling = SAMPLING_MAP.get(params.get('pointSampling'))
        const points = pointSampling.create(
            params.get('scale'), this.width, this.height
        )
        this.grid = new Grid(this.width, this.height, () => 0)
        const multiFill = new OrganicMultiFill(points, value => ({
            chance:     params.get('chance'),
            isEmpty:    point => this.grid.get(point) === 0,
            setValue:   point => this.grid.set(point, value),
            growth: params.get('growth'),
        }))
        this.regionCount = multiFill.size
    }

    get(point) {
        return this.grid.get(point)
    }
}