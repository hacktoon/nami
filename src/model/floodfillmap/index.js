import { Schema, Type } from '/lib/schema'
import { OrganicFloodFill } from '/lib/floodfill/organic'
import { FillMap } from '/lib/floodfill'
import { Grid } from '/lib/grid'
import { EvenPointSampling } from '/lib/point/sampling'
import { BaseMap } from '/model/lib/map'
import { MapDiagram } from './diagram'


export default class FloodFillMap extends BaseMap {
    static id = 'FloodFillMap'

    static schema = new Schema(
        Type.number('width', 'Width', 150, {step: 1, min: 1, max: 256}),
        Type.number('height', 'Height', 100, {step: 1, min: 1, max: 256}),
        Type.number('scale', 'Scale', 5, {step: 1, min: 1}),
        Type.number('iterations', 'Iterations', 10, {step: 1, min: 0}),
        Type.number('variability', 'Variability', 0.4, {
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
        this.variability = params.get('variability')
        this.grid = new Grid(this.width, this.height, () => 0)
        this.fillMap = this.buildFillMap()

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

    buildFillMap() {
        const fills = []
        const origins = EvenPointSampling.create(
            this.scale,
            this.width,
            this.height
        )
        for(let i = 0; i < origins.length; i++) {
            const fill = this.buildFloodFill(this.grid, origins[i], i + 1)
            fills.push(fill)
        }
        const fillMap = new FillMap(fills)
        while(fillMap.canGrow()) {
            fillMap.grow()
        }
        return fillMap
    }

    buildFloodFill(grid, origin, id) {
        const params = {
            isEmpty:   point => grid.get(point) === 0,
            setValue:  point => grid.set(point, id),
        }
        return new OrganicFloodFill(
            origin, params, this.iterations, this.variability
        )
    }

    get(point) {
        return this.grid.get(point)
    }
}