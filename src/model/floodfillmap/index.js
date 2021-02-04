import { Schema, Type } from '/lib/schema'
import { BaseFloodFill } from '/lib/floodfill/base'
import { Grid } from '/lib/grid'
import { Point } from '/lib/point'
import { BaseMap } from '/model/lib/map'
import { MapDiagram } from './diagram'


export default class FloodFillMap extends BaseMap {
    static id = 'FloodFillMap'

    static schema = new Schema(
        Type.number('width', 'Width', 200, {step: 1, min: 1}),
        Type.number('height', 'Height', 150, {step: 1, min: 1}),
        Type.number('count', 'Count', 15, {step: 1, min: 1}),
        Type.text('seed', 'Seed', '')
    )
    static diagram = MapDiagram

    static create(params) {
        return new FloodFillMap(params)
    }

    constructor(params) {
        super(params)
        this.count = params.get('count')
        const origin = new Point(100, 75)
        this.grid = this.buildGrid(origin)
    }

    buildGrid(origin) {
        const grid = new Grid(this.width, this.height, () => 0)
        const fill = new BaseFloodFill(origin, {
            isEmpty:   point => grid.get(point) === 0,
            setValue:  point => grid.set(point, 1),
        })
        while(fill.canGrow()) {
            fill.grow()
        }
        return grid
    }

    get(point) {
        return this.grid.get(point)
    }


}
