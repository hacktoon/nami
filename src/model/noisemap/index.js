import { Random } from '/lib/random'
import { Grid } from '/lib/grid'
import { SimplexNoise } from '/lib/noise'
import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'

import { Diagram } from './image'


export default class NoiseMap {
    static meta = new MetaClass(
        Type.number("Width", 150),
        Type.number("Height", 150),
        Type.number("Detail", 8, {step: 1, min: 1, max: 20}),
        Type.number("Resolution", .5, {step: 0.1, min: 0.1}),
        Type.number("Scale", .01, {step: 0.01, min: 0.01}),
        Type.seed("Seed", '')
    )
    static Diagram = Diagram

    static create(data) {
        const config = NoiseMap.meta.parseConfig(data)
        const {width, height, detail, resolution, scale, seed} = config
        Random.seed = seed
        const simplex = new SimplexNoise()
        const grid = new Grid(width, height, point => {
            let {x, y} = point
            return simplex.noise(detail, x, y, resolution, scale, 0, 255)
        })
        return new NoiseMap(grid, config)
    }

    constructor(grid, {width, height, detail, resolution, seed}) {
        this.grid = grid
        this.width = width
        this.height = height
        this.detail = detail
        this.resolution = resolution
        this.seed = seed
    }

    get(point) {
        return this.grid.get(point)
    }
}
