import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'
import { Grid } from '/src/lib/grid'
import { Surface } from './data'
import { buildRegionGrid } from './fill'


export class ZoneBasin {
    #grid

    constructor(worldPoint, params) {
        // rect scaled to world size, for noise locality
        this.size = params.zoneSize
        this.#grid = this.#buildGrid({...params, worldPoint})
    }

    #buildGrid(context) {
        const regionGrid = buildRegionGrid(context)
        return zoneGrid
    }


    get(point) {
        const surfaceId = this.#grid.get(point)
        return Surface.parse(surfaceId)
    }
}
