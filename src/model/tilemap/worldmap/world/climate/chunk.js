import { Point } from '/src/lib/geometry/point'
import { Rect } from '/src/lib/geometry/rect'
import { Grid } from '/src/lib/grid'

import { Climate } from './data'


const HOT_RATIO = .65
const WARM_RATIO = .5
const TEMPERATE_RATIO = .3
const COLD_RATIO = .1


export class ClimateChunk {
    #grid

    constructor(context) {
        this.size = context.chunkSize
        this.#grid = buildModel(context)
    }

    get(chunkPoint) {
        return Climate.parse(this.#grid.get(chunkPoint))
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
    // Generate a boolean grid (land or water)
    const {worldPoint, world, rect, chunkRect} = context
    const relativePoint = Point.multiplyScalar(worldPoint, chunkRect.width)
    const noiseRect = Rect.multiply(rect, chunkRect.width)
    return Grid.fromRect(chunkRect, chunkPoint => {
        const noisePoint = Point.plus(relativePoint, chunkPoint)
        const noise = world.noise.get4DChunkClimate(noiseRect, noisePoint)
        if (noise > HOT_RATIO)       return Climate.HOT.id
        if (noise > WARM_RATIO)      return Climate.WARM.id
        if (noise > TEMPERATE_RATIO) return Climate.TEMPERATE.id
        if (noise > COLD_RATIO)      return Climate.COLD.id
        return Climate.FROZEN.id
    })
}
