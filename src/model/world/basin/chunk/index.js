import { Point } from '/src/lib/math/point'
import { Color } from '/src/lib/color'

import {
    buildModel,
    TYPE_LAND,
    TYPE_RIVER,
    TYPE_WATER,
    TYPE_MARGIN,
    TYPE_SHORE,
    TYPE_CHANNEL,
} from './model'


const COLOR_MAP = {
    [TYPE_LAND]: '#71b13e',
    [TYPE_WATER]: '#1f2e5d',
    [TYPE_RIVER]: '#254a65',
    [TYPE_MARGIN]: '#57894b',
    // [TYPE_MARGIN]: '#71b13e',
    [TYPE_CHANNEL]: '#0e112e',
    [TYPE_SHORE]: '#18264f',
}


export class BasinChunk {
    #model

    constructor(context) {
        this.#model = buildModel(context)
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, chunk} = props
        if (tileSize < 10)
            return
        chunk.surface.draw(props, params)
        const chunkTileSize = tileSize / chunk.size
        const model = this.#model
        // const anchorMap = model.regionModel.anchorMap
        // const regionColorMap = new Map()
        // for(let id =0; id < 50; id++) {
        //     regionColorMap.set(id, new Color())
        // }
        for (let x=0; x < chunk.size; x++) {
            const xSize = x * chunkTileSize
            for (let y=0; y < chunk.size; y++) {
                const chunkPoint = [y, x]
                const ySize = y * chunkTileSize
                let chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const type = model.grid.get(chunkPoint)
                // const blocked = model.blocked.get(chunkPoint)
                // const region = model.regionModel.regionGrid.get(chunkPoint)
                let color = Color.fromHex(COLOR_MAP[type])
                if (params.get('showErosion')) {
                    // if (blocked) color = color.darken(100)
                    canvas.rect(chunkCanvasPoint, chunkTileSize, color.toHex())
                }
                // const regionColor = regionColorMap.get(region).average(color).average(color).toHex()
                // const regionColor = region % 2 == 0 ? '#000' : color.toHex()
                // canvas.rect(chunkCanvasPoint, chunkTileSize, regionColor)
                // const anchor = anchorMap.get(region)
                // if (anchor && Point.equals(anchor, chunkPoint)) {
                //     canvas.rect(chunkCanvasPoint, chunkTileSize, '#444')
                // }
            }
        }
        // let x = model.chunkMidpoint[0] * chunkTileSize
        // let y = model.chunkMidpoint[1] * chunkTileSize
        // let chunkCanvasPoint = Point.plus(canvasPoint, [x, y])
        // canvas.rect(chunkCanvasPoint, chunkTileSize, '#F00')

        // gates
        // model.routes.forEach(({ source, target }) => {
        //     let x = source[0] * chunkTileSize
        //     let y = source[1] * chunkTileSize
        //     let chunkCanvasPoint = Point.plus(canvasPoint, [x, y])
        //     canvas.rect(chunkCanvasPoint, chunkTileSize, '#F0F')

        //     x = target[0] * chunkTileSize
        //     y = target[1] * chunkTileSize
        //     chunkCanvasPoint = Point.plus(canvasPoint, [x, y])
        //     canvas.rect(chunkCanvasPoint, chunkTileSize, '#FF0')
        // })
    }
}
