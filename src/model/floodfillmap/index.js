import { Schema, Type } from '/lib/schema'
import { OrganicFloodFill } from '/lib/floodfill/organic'
import { MultiFill } from '/lib/floodfill'
import { Grid } from '/lib/grid'
import { RandomPointSampling, EvenPointSampling } from '/lib/point/sampling'
import { BaseMap } from '/model/lib/map'
import { MapDiagram } from './diagram'


export default class FloodFillMap extends BaseMap {
    static id = 'FloodFillMap'

    static schema = new Schema(
        Type.number('width', 'Width', 150, {step: 1, min: 1, max: 256}),
        Type.number('height', 'Height', 100, {step: 1, min: 1, max: 256}),
        Type.number('scale', 'Scale', 20, {step: 1, min: 1}),
        Type.number('iterations', 'Iterations', 10, {step: 1, min: 0}),
        Type.number('chance', 'Chance', 0.3, {
            step: 0.01, min: 0.1, max: 1
        }),
        Type.text('seed', 'Seed', '')
    )
    static diagram = MapDiagram

    static create(params) {
        return new FloodFillMap(params)
    }

    constructor(params) {
        super(params)
        this.scale = params.get('scale')
        this.iterations = params.get('iterations')
        this.chance = params.get('chance')
        this.grid = new Grid(this.width, this.height, () => 0)
        this.fillMap = this.buildMultiFill(this.grid)
    }

    buildMultiFill(grid) {
        const origins = EvenPointSampling.create(
            this.scale, this.width, this.height
        )
        const buildFill = (center, value) => {
            const params = {
                isEmpty:   point => grid.get(point) === 0,
                setValue:  point => grid.set(point, value),
                iterations: this.iterations,
                chance: this.chance,
            }
            return new OrganicFloodFill(center, params)
        }
        return new MultiFill(origins, buildFill)
    }

    get(point) {
        return this.grid.get(point)
    }
}