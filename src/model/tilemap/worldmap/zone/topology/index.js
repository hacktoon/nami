import { Color } from '/src/lib/color'
import { midpointDisplacement } from '/src/lib/geometry/fractal/midpointdisplacement.js'
import { Random } from '/src/lib/random.js'
import { Point } from '/src/lib/geometry/point'

import { buildRegionGrid } from './model'


export class TopologyZone {
    #regionGrid

    constructor(context) {
        const {world, zone, zoneRect} = context
        this.world = world
        this.zone = zone
        this.zoneSize = context.zoneSize
        this.zoneRect = zoneRect
        this.#regionGrid = buildRegionGrid(context)
    }

    get(worldPoint) {
        return {
            region: this.#regionGrid.get(worldPoint),
        }
    }

    getJointPoints(worldPoint) {
        // return the 4 zone points at edges with adjacent zone points
        const points = []
        // this.zoneRect.width / 2
        const joint = this.world.topology.getJoint(worldPoint)
        Point.adjacents(worldPoint, (sidePoint, direction) => {
            const sideJoint = this.world.topology.getJoint(sidePoint)
            const sideAverage = (joint + sideJoint) / 2  // percentage of the side's length
            // map each axis coordinate to random value in zone's rect edge
            // summing values from origin [0, 0] bottom-right oriented
            // convert direction axis pairs to edges in a rect
            const pointInEdge = direction.axis.map(dir => {
                const maxZoneIndex = this.zoneSize - 1
                if (dir < 0) return 0
                if (dir > 0) return maxZoneIndex
                // choose the random point in the edge if axis is 0 (it varies along this edge)
                return Math.floor(sideAverage * (maxZoneIndex))
            })
            // if (Point.equals(worldPoint, [40, 25])) {
            //     console.log(`${sideAverage.toFixed(1)}, ${pointInEdge}, ${direction.name}, ${direction.axis}`);
            // }
            points.push([pointInEdge, direction])
        })
        return points
    }

    getRegion(point) {
        return this.#regionGrid.get(point)
    }

    draw(props, params) {
        // render zone tiles
        const {canvas, tilePoint, canvasPoint, tileSize, world, zone} = props
        const regionId = this.getRegion(tilePoint)
        const size = tileSize / this.zoneSize
        // get midpoint in the zone rect grid
        const midpoint = world.topology.getMidpoint(tilePoint)
        const isBorder = world.surface.isBorder(tilePoint)
        let midpointColor = world.surface.isWater(tilePoint)
                            ? isBorder ? Color.BLUE : Color.PURPLE
                            : isBorder ? Color.RED : Color.DARKRED

        // Grid.fromRect(this.zoneRect, gridPoint => {
        //     const surface = zone.surface.get(gridPoint)

        //     canvas.rect(zoneCanvasPoint, size, surface.color.toHex())
        // })
        zone.surface.draw(props, params)

        this.#drawLines(props, midpoint)

        // render the zone midpoint
        const drawPoint = Point.plus(canvasPoint, Point.multiplyScalar(midpoint, size))
        canvas.rect(drawPoint, size, midpointColor.toHex())
    }

    #drawLines(props, midpoint) {
        const {canvas, tilePoint, canvasPoint, tileSize, world, zone} = props
        const size = tileSize / this.zoneSize
        // render topology lines
        for (let [jointPoint, direction] of this.getJointPoints(tilePoint)) {
            const surface = zone.surface.get(jointPoint)
            const zoneCanvasPoint = Point.plus(canvasPoint, Point.multiplyScalar(jointPoint, size))
            // if (Point.equals(tilePoint, [40, 25])) {
            //     console.log(points);

            // }
            // const points = midpointDisplacement(midpoint, jointPoint)
            const startPoint = Point.plus(midpoint, direction.axis)
            const points = this.#drawPath(midpoint, jointPoint)
            for (let point of points) {
                const surface = zone.surface.get(point)
                const drawPoint = Point.plus(canvasPoint, Point.multiplyScalar(point, size))
                canvas.rect(drawPoint, size, surface.color.darken(30).toHex())
            }
            // draw the joints at edges
            // canvas.rect(zoneCanvasPoint, size, surface.color.darken(50).toHex())
        }
    }

    #drawPath(src, target) {
        const midpoint = perturbedMidpoint(src, target)
        const p1 = this.#drawLine(src, midpoint)
        const p2 = this.#drawLine(midpoint, target)
        return [...p1, ...p2]
    }

    #drawLine(src, target) {
        // do not include the target point in the path
        const points = []
        let current = [...src]

        while (Point.differs(current, target)) {
            let [cx, cy] = current
            const [tx, ty] = target
            points.push([cx, cy])
            if (Random.chance(.5)) {
                if (cx < tx) cx++
                else if (cx > tx) cx--
            } else {
                if (cy < ty) cy++
                else if (cy > ty) cy--
            }
            current = [cx, cy]
        }
        points.push(target)
        return points
    }
}


function perturbedMidpoint([x1, y1], [x2, y2]) {
    const diff = 2
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    let modX = 0
    let modY = 0
    if (deltaX > deltaY) {
        modY = Random.int(-diff, diff)
    } else {
        modX = Random.int(-diff, diff)
    }
    const midX = Math.floor((x1 + x2) / 2) + modY
    const midY = Math.floor((y1 + y2) / 2) + modX
    return [midX, midY];
}