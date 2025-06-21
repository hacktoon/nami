import { Point } from '/src/lib/geometry/point'

import { buildRegionGridMap } from './model'


export class TopologyZone {
    #regionGrid
    #originMap
    #regionColorMap

    constructor(context) {
        const { world, zone, zoneRect } = context
        this.world = world
        this.zone = zone
        this.zoneSize = context.zoneSize
        this.zoneRect = zoneRect
        const {
            regionGrid, regionColorMap, originMap
        } = buildRegionGridMap(context)
        this.#regionGrid = regionGrid
        this.#originMap = originMap
        this.#regionColorMap = regionColorMap
    }

    get(worldPoint) {
        return {
            region: this.#regionGrid.get(worldPoint),
        }
    }

    getJointPoints(worldPoint) {
        // return the 4 zone points at edges with adjacent zone points
        const points = []
        const joint = this.world.topology.getJoint(worldPoint)
        Point.adjacents(worldPoint, (sidePoint, direction) => {
            const sideJoint = this.world.topology.getJoint(sidePoint)
            const sideAverage = (joint + sideJoint) / 2  // percentage of the side's length
            // map each axis coordinate to random value in zone's rect edge
            // summing values from origin [0, 0] bottom-right oriented
            // convert direction axis pairs to edges in a rectx+half
            const maxZoneIndex = this.zoneSize - 1
            const pointInEdge = direction.axis.map(dir => {
                // map negative axis to 0 for multiplication
                if (dir < 0) return 0
                if (dir > 0) return maxZoneIndex
                // choose the random point in the edge if axis is 0 (it varies along this edge)
                return Math.floor(sideAverage * maxZoneIndex)
            })
            points.push([pointInEdge, direction])
            // if (Point.equals(worldPoint, [44, 30]) ||  Point.equals(worldPoint, [45, 30])) {
            //     console.log(
            //         `${worldPoint}, ${pointInEdge}, ${direction.name} \n${joint.toFixed(2)} avg ${sideJoint.toFixed(2)} = ${sideAverage.toFixed(2)}, `);
            // }
        })

        return points
    }

    getRegion(zonePoint) {
        const regionId = this.#regionGrid.get(zonePoint)
        let regionColor = this.#regionColorMap.get(regionId)
        const origin = this.#originMap.get(regionId)
        return {
            id: regionId,
            color: regionColor,
            origin
        }
    }

    draw(props, params) {
        // render zone tiles
        const { canvas, tilePoint, canvasPoint, tileSize, world, zone } = props
        const zoneSize = this.zoneSize
        const zoneTileSize = tileSize / zoneSize

        // render zone tiles
        for (let x = 0; x < zoneSize; x++) {
            const xSize = x * zoneTileSize
            for (let y = 0; y < zoneSize; y++) {
                const zonePoint = [y, x]
                const ySize = y * zoneTileSize
                const zoneCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])

                // draw surface per default
                const surface = zone.surface.get(zonePoint)
                canvas.rect(zoneCanvasPoint, zoneTileSize, surface.color.toHex())

                // draw region selected over surface
                const region = this.getRegion(zonePoint)
                const condx = region.origin[0] > 4 && region.origin[0] < 11
                const condy = region.origin[1] > 4 && region.origin[1] < 11
                const cond = condx || condy
                if (cond) {
                    const outline = Math.floor(zoneTileSize / 8)
                    if (world.surface.isLand(tilePoint)) {
                        canvas.outline(zoneCanvasPoint, zoneTileSize, outline, '#71b13e')
                        // canvas.rect(zoneCanvasPoint, zoneTileSize, '#71b13e')
                    } else {
                        canvas.outline(zoneCanvasPoint, zoneTileSize, outline, '#1d2255')
                        // canvas.rect(zoneCanvasPoint, zoneTileSize, '#1d2255')
                    }
                }
                // if (world.surface.isBorder(tilePoint)) {
                //     color = color.darken(20)
                // }
            }
        }
        // render joints
        for (let [pt, dir] of this.getJointPoints(tilePoint)) {
            const x = pt[0] * zoneTileSize
            const y = pt[1] * zoneTileSize
            const zoneCanvasPoint = Point.plus(canvasPoint, [x, y])
            const color = world.surface.isLand(tilePoint) ? '#D13131' : '#5231D1'
            canvas.rect(zoneCanvasPoint, zoneTileSize, color)
        }
    }

}


// 1 2 4 8 16 32