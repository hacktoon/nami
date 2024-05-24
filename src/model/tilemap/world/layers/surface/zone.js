import { Point } from '/src/lib/point'
import { Rect } from '/src/lib/number'
import { Grid } from '/src/lib/grid'
import { SimplexNoise } from '/src/lib/noise'
import {
    Surface,
    ContinentSurface,
    OceanSurface,
} from './data'


export class ZoneSurface {
    #grid

    constructor(worldPoint, {layers, zoneSize}) {
        // rect scaled to world size, for noise locality
        this.#grid = this.#buildGrid(worldPoint, layers, zoneSize)
        this.size = zoneSize
    }

    #buildGrid(worldPoint, layers, zoneSize) {
        const zoneRect = new Rect(zoneSize, zoneSize)
        const noiseLayer = layers.noise
        const isLand = layers.surface.isLand(worldPoint)
        const isBorder = layers.surface.isBorder(worldPoint)
        const baseZonePoint = Point.multiplyScalar(worldPoint, zoneSize)
        return Grid.fromRect(zoneRect, indexPoint => {
            const point = Point.plus(baseZonePoint, indexPoint)
            const noise = noiseLayer.get2D(point, 'grained')
            if (isLand) {
                if (isBorder) {
                    return noise > .2 ? ContinentSurface.id : OceanSurface.id
                }
                return ContinentSurface.id
            }

            return OceanSurface.id
        })
    }

    get(point) {
        const surfaceId = this.#grid.get(point)
        return Surface.parse(surfaceId)
    }
}