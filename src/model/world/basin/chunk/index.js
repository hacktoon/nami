import { Point } from '/src/lib/math/point'
import { Color } from '/src/lib/color'

import {
    buildModel,
    TYPE_LAND,
    TYPE_EROSION,
    TYPE_WATER,
    TYPE_EROSION_SIDE,
    TYPE_CHANNEL_SIDE,
    TYPE_CHANNEL,
} from './model'


const COLOR_MAP = {
    [TYPE_LAND]: '#678e8d',
    [TYPE_WATER]: '#1f2e5d',
    [TYPE_EROSION]: '#314046',
    [TYPE_EROSION_SIDE]: '#537776',
    // [TYPE_EROSION_SIDE]: '#57894b',
    [TYPE_CHANNEL]: '#090c22',
    [TYPE_CHANNEL_SIDE]: '#142142',
}


export class BasinChunk {
    #model

    constructor(context) {
        this.#model = buildModel(context)
    }

    get(chunkPoint) {
        return {
            type: this.#model.type.get(chunkPoint),
            routes: this.#model.routes,
        }
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, world, chunk} = props
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
                const type = model.type.get(chunkPoint)
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
        //     canvas.rect(chunkCanvasPoint, chunkTileSize, 'rgb(82, 154, 190)')

        //     x = target[0] * chunkTileSize
        //     y = target[1] * chunkTileSize
        //     chunkCanvasPoint = Point.plus(canvasPoint, [x, y])
        //     canvas.rect(chunkCanvasPoint, chunkTileSize, 'rgb(50, 97, 127)')
        // })
    }
}
