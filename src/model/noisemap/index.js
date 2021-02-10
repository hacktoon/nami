import { Grid } from '/lib/grid'
import { BaseMap } from '/model/lib/map'
import { SimplexNoise } from '/lib/noise'
import { Schema, Type } from '/lib/schema'
import { MapUI } from '/ui/map'

import { MapDiagram } from './diagram'


const SCHEMA = new Schema(
    Type.number('width', 'Width', 150, {step: 1, min: 1}),
    Type.number('height', 'Height', 150, {step: 1, min: 1}),
    Type.number('detail', 'Detail', 8, {step: 1, min: 1, max: 20}),
    Type.number('resolution', 'Resolution', .5, {step: 0.1, min: 0.1}),
    Type.number('scale', 'Scale', .01, {step: 0.01, min: 0.01}),
    Type.text('seed', 'Seed', '')
)


export default class NoiseMap extends BaseMap {
    static diagram = MapDiagram
    static label = 'Noise map'
    static schema = SCHEMA
    static ui = MapUI

    static create(params) {
        return new NoiseMap(params)
    }

    constructor(params) {
        super(params)
        this.detail = params.get('detail')
        this.resolution = params.get('resolution')
        this.scale = params.get('scale')

        const simplex = new SimplexNoise(
            this.detail,
            this.resolution,
            this.scale
        )
        let max = -Infinity
        let min = Infinity
        this.grid = new Grid(this.width, this.height, point => {
            let val = simplex.noise(point)
            if (val > max) max = val
            if (val < min) min = val
            return val
        })
        console.log(min, max);
    }

    get(point) {
        return this.grid.get(point)
    }
}
