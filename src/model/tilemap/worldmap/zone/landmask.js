import { Point } from '/src/lib/geometry/point'
import { Rect } from '/src/lib/geometry/rect'
import { Grid } from '/src/lib/grid'


const SURFACE_NOISE_RATIO = .6
const REGION_WATER = false
const REGION_LAND = true


export class LandMaskZone {
    #landMaskGrid

    constructor(context) {
        this.size = context.zoneSize
        this.#landMaskGrid = buildModel(context)
    }

    isLand(zonePoint) {
        return this.#landMaskGrid.get(zonePoint)
    }

    draw(props, params) {
        const {canvas, canvasPoint, tilePoint, tileSize, world} = props
        const zoneSize = this.size
        const size = tileSize / zoneSize
        // render zone tiles
        const isBorder = world.surface.isBorder(tilePoint)
        for (let x=0; x < zoneSize; x++) {
            const xSize = x * size
            for (let y=0; y < zoneSize; y++) {
                const zonePoint = [y, x]
                const ySize = y * size
                const zoneCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                let color = this.isLand(zonePoint)
                    ? isBorder ? '#57892d' : '#71b13e'
                    : isBorder ? '#1d2255' : '#2f367d'
                canvas.rect(zoneCanvasPoint, size, color)
            }
        }
    }
}


function buildModel(context) {
    const hash = Point.hash(context.worldPoint)
    // cache de zone grid noise
    // if (SURFACE_GRID_CACHE.has(hash)) {
    //     return SURFACE_GRID_CACHE.get(hash)
    // }
    // Generate a boolean grid (land or water)
    const {worldPoint, world, rect, zoneRect} = context
    const relativePoint = Point.multiplyScalar(worldPoint, zoneRect.width)
    const noiseRect = Rect.multiply(rect, zoneRect.width)
    const landMaskGrid = Grid.fromRect(zoneRect, zonePoint => {
        const noisePoint = Point.plus(relativePoint, zonePoint)
        const noise = world.noise.get4DZoneOutline(noiseRect, noisePoint)
        return noise > SURFACE_NOISE_RATIO ? REGION_LAND : REGION_WATER
    })
    // SURFACE_GRID_CACHE.set(hash, landMaskGrid)
    return landMaskGrid
}
