import {Color} from '/src/lib/color.js'
import {
    buildRegionGrid,
 } from './model'


export class TopologyZone {
    #regionGrid

    constructor(context) {
        const {world, zones, zoneRect} = context
        this.world = world
        this.zones = zones
        this.zoneRect = zoneRect
        this.#regionGrid = buildRegionGrid(context)
    }

    get(point) {
        return {
            region: this.#regionGrid.get(point),
        }
    }

    getRegion(point) {
        return this.#regionGrid.get(point)
    }

    getText(point) {
        const region = this.getRegion(point)
        return `Topology(region=${region})`
    }

    draw(props) {
        const {canvas, tilePoint, canvasPoint, zones, tileSize} = props
        const zone = this.#regionGrid.get(tilePoint)
        const size = tileSize / this.zoneSize
        const color = Color.RED
        // render zone tiles
        for (let x=0; x < zoneSize; x++) {
            const xSize = x * size
            for (let y=0; y < zoneSize; y++) {
                const zonePoint = [y, x]
                const ySize = y * size
                const zoneCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                canvas.rect(zoneCanvasPoint, size, color.toHex())
            }
        }
    }
}
