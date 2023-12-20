import { PointMap } from '/src/lib/point/map'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { Color } from '/src/lib/color'

import { BasinFill } from './fill'
import { ErosionPointMap } from './erosion'


export class BasinLayer {
    // map a point to a basin id
    #basinMap = new PointMap()

    // the walk distance of each basin point to the shore
    // used to determine river stretch
    #distanceMap = new PointMap()

    // map a point to a number representing the bitmask value
    // of erosion's direction 3x3 cross
    // substitute
    #erosionMap
    #layoutMap = new PointMap()

    // the point in the middle of each block that sets erosion
    #midpointMap = new PointMap()

    // the highest points of basins that borders others basins
    #dividePoints = new PointSet()

    // a color for each basin
    #colorMap = new Map()

    constructor(rect, layers) {
        this.#erosionMap = new ErosionPointMap(rect)
        const context = {
            rect,
            layers: layers,
            basinMap: this.#basinMap,
            midpointMap: this.#midpointMap,
            colorMap: this.#colorMap,
            distanceMap: this.#distanceMap,
            dividePoints: this.#dividePoints,
            layoutMap: this.#layoutMap,
            erosionMap: this.#erosionMap,
        }
        // start filling from land borders
        let origins = context.layers.surface.landBorders
        const fill = new BasinFill()
        fill.start(origins, context)
    }

    get count() {
        return this.#basinMap.size
    }

    get(point) {
        return {
            id: this.#basinMap.get(point),
            distance: this.getDistance(point),
            midpoint: this.getMidpoint(point),
            layout: this.#layoutMap.get(point),
            erosionFlow: this.#erosionMap.getFlow(point),
            erosionLines: this.getErosionLines(point),
        }
    }

    getColor(point) {
        if (! this.#basinMap.has(point)) {
            return Color.DARKBLUE
        }
        const id = this.#basinMap.get(point)
        return this.#colorMap.get(id)
    }

    getErosionAxis(point) {
        const direction = this.#erosionMap.getFlow(point)
        return direction.axis
    }

    getDividePoints() {
        return this.#dividePoints.points
    }

    getDistance(point) {
        return this.#distanceMap.get(point)
    }

    getMidpoint(point) {
        return this.#midpointMap.get(point)
    }

    getErosionLines(point) {
        const borderPoints = this.#erosionMap.getBorderPoints(point)
        return []
    }

    getText(point) {
        if (! this.#erosionMap.hasFlow(point))
            return ''
        const basin = this.get(point)
        const attrs = [
            `${basin.id}`,
            `erosionFlow=${basin.erosionFlow.name}`,
            `distance=${basin.distance}`,
            `midpoint=${basin.midpoint}`,
            `layout=${basin.layout}`,
        ].join(',')
        return `Basin(${attrs})`
    }

    isDivide(point) {
        return this.#dividePoints.has(point)
    }

    draw(point, props) {
        const {canvas, canvasPoint, tileSize} = props
        const midPoint = this.getMidpoint(point)
        const offsetPoint = Point.multiplyScalar(midPoint, tileSize)
        const midCanvasPoint = Point.plus(canvasPoint, offsetPoint)
        for(let erosionInput of this.getErosionLines(point)) {
            // const [neighbor, rate] = erosionInput
            // build a point for each flow that points to this point
            // const axis = Point.minus(neighbor, point)
            // if (point[0] == 28 && point[1] == 12) {
            //     console.log(neighbor, edgePoint, rate)
            // }
            // canvas.line(midCanvasPoint, [0, 0], 2, "#00F")
        }
        canvas.rect(midCanvasPoint, 4, "#05F")
    }
}
