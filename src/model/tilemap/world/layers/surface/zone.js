import { Point } from '/src/lib/point'
import { Rect } from '/src/lib/number'
import { Grid } from '/src/lib/matrix'
import { SimplexNoise } from '/src/lib/noise'
import {
    Surface,
    LandSurface,
    WaterSurface,
} from './data'


export class ZoneSurface {
    #grid

    constructor(point, {layers, zoneSize}) {
        const rect = new Rect(zoneSize, zoneSize)
        const noiseLayer = layers.noise
        const isLand = layers.surface.isLand(point)
        const notBorder = ! layers.surface.isBorder(point)
        // rect scaled to world size, for noise locality
        const worldRect = Rect.multiply(rect, zoneSize)
        const baseZonePoint = Point.multiplyScalar(point, zoneSize)
        this.#grid = new Grid(zoneSize, zoneSize, (indexPoint) => {
            const point = Point.plus(baseZonePoint, indexPoint)
            const noise = noiseLayer.get2D(point, 'outline')
            if (noise > .2) {
                return LandSurface.id
            }
            // if (noise > .6) {
            //     // remove islands on open water
            //     if (! isLand && notBorder) {
            //         return WaterSurface.id
            //     }
            //     return LandSurface.id
            // }
            // // remove inner lakes on continents
            // if (isLand && notBorder) {
            //     return LandSurface.id
            // }
            return WaterSurface.id
        })
        this.size = chunkSize
    }

    get(point) {
        const surfaceId = this.#grid.get(point)
        return Surface.parse(surfaceId)
    }
}