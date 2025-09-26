import { Point } from '/src/lib/geometry/point'
import { Rect } from '/src/lib/geometry/rect'
import { Grid } from '/src/lib/grid'

import { Rain } from './data'


const WET_RATIO = .2
const SEASONAL_RATIO = .4
const DRY_RATIO = .6
const ARID_RATIO = .8


export class RainChunk {
    #grid

    constructor(context) {
        this.size = context.chunkSize
        this.#grid = buildModel(context)
    }

    get(chunkPoint) {
        return Rain.parse(this.#grid.get(chunkPoint))
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, chunk} = props
        const chunkSize = this.size
        const size = tileSize / chunkSize
        // render chunk tiles
        for (let x=0; x < chunkSize; x++) {
            const xSize = x * size
            for (let y=0; y < chunkSize; y++) {
                const chunkPoint = [y, x]
                const ySize = y * size
                const chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const type = this.get(chunkPoint)
                // let color = chunk.surface.isLand(chunkPoint) ? type.color.toHex() : '#2f367d'
                let color = type.color.toHex()
                canvas.rect(chunkCanvasPoint, size, color)
            }
        }
    }
}


function buildModel(context) {
    const {worldPoint, world, rect, chunkRect, chunkSize} = context
    const relativePoint = Point.multiplyScalar(worldPoint, chunkSize)
    const noiseRect = Rect.multiply(rect, chunkSize)
    return Grid.fromRect(chunkRect, chunkPoint => {
        const noisePoint = Point.plus(relativePoint, chunkPoint)
        const noise = world.noise.get4DChunkRain(noiseRect, noisePoint)
        if (noise > ARID_RATIO)     return Rain.ARID.id
        if (noise > DRY_RATIO)      return Rain.DRY.id
        if (noise > SEASONAL_RATIO) return Rain.SEASONAL.id
        if (noise > WET_RATIO)      return Rain.WET.id
        return Rain.HUMID.id
    })
}
