import { Color } from '/src/lib/color.js'
import { Grid } from '/src/lib/grid.js'
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

        // render topology lines
        for (let [jointPoint, _] of this.getJointPoints(tilePoint)) {
            const surface = zone.surface.get(jointPoint)
            const zoneCanvasPoint = Point.plus(canvasPoint, Point.multiplyScalar(jointPoint, size))

            // canvas.rect(zoneCanvasPoint, size, surface.color.darken(50).toHex())

            for (let point of this.#drawLine(jointPoint, midpoint)) {
                const surface = zone.surface.get(point)
                const zoneCanvasPoint = Point.plus(canvasPoint, Point.multiplyScalar(point, size))
                canvas.rect(zoneCanvasPoint, size, surface.color.darken(20).toHex())
            }

        }

        // render the zone midpoint
        const zoneCanvasPoint = Point.plus(canvasPoint, Point.multiplyScalar(midpoint, size))
        canvas.rect(zoneCanvasPoint, size, midpointColor.toHex())
    }

    #drawLine(src, target) {
        // do not include the target point in the path
        const points = [src]
        let current = [...src]
        while (Point.differs(current, target)) {
            let [cx, cy] = current
            const [tx, ty] = target
            if (Random.chance(.5)) {
                if (cx < tx) cx++
                else if (cx > tx) cx--
            } else {
                if (cy < ty) cy++
                else if (cy > ty) cy--
            }
            current = [cx, cy]
            points.push([cx, cy])
        }
        points.push(target)
        return points
    }
}
