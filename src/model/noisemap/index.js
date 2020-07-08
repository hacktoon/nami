import { Random } from '/lib/random'
import { Grid } from '/lib/grid'
import { SimplexNoise } from '/lib/noise'
import { Meta, Schema } from '/lib/meta'

import { Image } from './image'


const META = new Meta('NoiseMap',
    Schema.number("Width", 150),
    Schema.number("Height", 150),
    Schema.number("Resolution", 5, {step: 1, min: 1}),
    Schema.seed("Seed", '')
)


export default class NoiseMap {
    static meta = META
    static Image = Image

    static create(data) {
        const config = META.parse(data)
        Random.seed = config.seed
        const noiseGenerator = new SimplexNoise()
        const grid = new Grid(config.width, config.height, point => {
            let {x, y} = point
            const scale = .01
            return noiseGenerator.noise(8, x, y, .6, scale, 0, 255)
        })
        return new NoiseMap(grid, config)
    }

    constructor(grid, {width, height, resolution, seed}) {
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
