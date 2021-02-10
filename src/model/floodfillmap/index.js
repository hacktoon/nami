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
        Type.number('iterations', 'Iterations', 20, {step: 1, min: 0}),
        Type.number('chance', 'Chance', 0.3, {
            step: 0.01, min: 0, max: 1
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
        this.fillMap = this.buildMultiFill(EvenPointSampling)

        // =============== TODO: just a test, remove
        let count = 0
        this.fillMap.forEach(fill => {
            if (fill.area < 5) {
                console.log(fill.area)
                count++
            }
        })
        // ===============
        console.log('total absorbed: ', count)

    }

    buildMultiFill(PointSampling) {
        const fills = []
        const origins = PointSampling.create(
            this.scale,
            this.width,
            this.height
        )
        for(let i = 0; i < origins.length; i++) {
            const value = i + 1
            const fill = this.buildFloodFill(this.grid, origins[i], value)
            fills.push(fill)
        }
        const multiFill = new MultiFill(fills)
        while(multiFill.canGrow()) {
            multiFill.grow()
        }
        return multiFill
    }

    buildFloodFill(grid, origin, id) {
        const params = {
            isEmpty:   point => grid.get(point) === 0,
            setValue:  point => grid.set(point, id),
        }
        return new OrganicFloodFill(
            origin, params, this.iterations, this.chance
        )
    }

    get(point) {
        return this.grid.get(point)
    }
}