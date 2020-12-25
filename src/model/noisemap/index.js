import { Grid } from '/lib/grid'
import { GenericMap } from '/model/lib/map'
import { SimplexNoise } from '/lib/noise'
import { Schema, Type } from '/lib/schema'

import { MapDiagram } from './diagram'


export default class NoiseMap extends GenericMap {
    static id = 'NoiseMap'

    static schema = new Schema(
        Type.number('width', 'Width', 150, {step: 1, min: 1}),
        Type.number('height', 'Height', 150, {step: 1, min: 1}),
        Type.number('detail', 'Detail', 8, {step: 1, min: 1, max: 20}),
        Type.number('resolution', 'Resolution', .5, {step: 0.1, min: 0.1}),
        Type.number('scale', 'Scale', .01, {step: 0.01, min: 0.01}),
        Type.text('seed', 'Seed', '')
    )
    static MapDiagram = MapDiagram

    static create(params) {
        return new NoiseMap(params)
    }

    constructor(params) {
        super(params)
        const simplex = new SimplexNoise()
        this.grid = new Grid(this.width, this.height,
            point => {
                let {x, y} = point
                return simplex.noise(
                    params.get('detail'),
                    x, y,
                    params.get('resolution'),
                    params.get('scale'),
                    0, 255)
            })
        this.resolution = params.get('resolution')
        this.detail = params.get('detail')
    }

    get(point) {
        return this.grid.get(point)
    }
}
