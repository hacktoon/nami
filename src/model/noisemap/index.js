import { Random } from '/lib/random'
import { Grid } from '/lib/grid'
import { SimplexNoise } from '/lib/noise'
import { Meta, Schema } from '/lib/meta'

import { Image } from './image'


const META = new Meta('NoiseMap',
    Schema.number("Width", 150),
    Schema.number("Height", 150),
    Schema.number("Resolution", .8, {step: 0.1, min: 0.1}),
    Schema.number("Scale", .01, {step: 0.01, min: 0.01}),
    Schema.seed("Seed", 'a')
)


export default class NoiseMap {
    static meta = META
    static Image = Image

    static create(data) {
        const config = META.parse(data)
        const {width, height, resolution, scale, seed} = config
        Random.seed = seed
        const simplex = new SimplexNoise()
        const grid = new Grid(width, height, point => {
            let {x, y} = point
            return simplex.noise(8, x, y, resolution, scale, 0, 255)
        })
        return new NoiseMap(grid, config)
    }

    constructor(grid, {width, height, resolution, seed}) {
        console.log('seed: ', seed);
        this.grid = grid
        this.width = width
        this.height = height
        this.resolution = resolution
        this.seed = seed
    }

    get(point) {
        return this.grid.get(point)
    }
}
