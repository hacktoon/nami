import { Point } from '/src/lib/geometry/point'
import { Random } from '/src/lib/random'

import { buildRegionGridMap } from './model'


export class TopologyZone {
    #regionGrid
    #originMap
    #regionColorMap
    #midpoint

    constructor(context) {
        const { world, zone, zoneRect, zoneSize } = context
        this.world = world
        this.zone = zone
        this.zoneSize = zoneSize
        this.zoneRect = zoneRect
        const {
            regionGrid, regionColorMap, originMap
        } = buildRegionGridMap(context)
        this.#regionGrid = regionGrid
        this.#originMap = originMap
        this.#regionColorMap = regionColorMap

        // generating the midpoint with minor variations
        this.#midpoint = [
            Math.floor(zoneSize / 2) + Random.int(-2, 2),
            Math.floor(zoneSize / 2) + Random.int(-2, 2),
        ]
    }

    get(worldPoint) {

        return {
            region: this.#regionGrid.get(worldPoint),
        }
    }

    getJointPoints(worldPoint) {
        // return the 4 zone points at edges with adjacent zone points
        const points = []
        const topology = this.world.topology.get(worldPoint)
        Point.adjacents(worldPoint, (sidePoint, direction) => {
            const sideTopology = this.world.topology.get(sidePoint)
            let jointRatio = Math.min(topology.road, sideTopology.road)  // they both choose the lower number
            // map each axis coordinate to random value in zone's rect edge
            // summing values from origin [0, 0] bottom-right oriented
            // convert direction axis pairs to edges in a rectx+half
            const maxZoneIndex = this.zoneSize - 1
            const pointInEdge = direction.axis.map(dir => {
                // map negative axis to 0 for multiplication
                if (dir < 0) return 0
                if (dir > 0) return maxZoneIndex
                // choose the random point in the edge if axis is 0 (it varies along this edge)
                return Math.floor(jointRatio * maxZoneIndex)
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
        this.drawZoneTiles(props, zoneSize, zoneTileSize)

        // render joints
        for (let [jointPoint, direction] of this.getJointPoints(tilePoint)) {
            const x = jointPoint[0] * zoneTileSize
            const y = jointPoint[1] * zoneTileSize
            const zoneCanvasPoint = Point.plus(canvasPoint, [x, y])
            const color = world.surface.isLand(tilePoint) ? '#D13131' : '#5231D1'
            canvas.rect(zoneCanvasPoint, zoneTileSize, color)

            for (let pathPoint of connectPoints(this.#midpoint, jointPoint)) {
                const x = pathPoint[0] * zoneTileSize
                const y = pathPoint[1] * zoneTileSize
                const pathCanvasPoint = Point.plus(canvasPoint, [x, y])
                const color = 'rgba(255, 255, 255, .1)'
                canvas.rect(pathCanvasPoint, zoneTileSize, color)

            }
        }

        // draw midpoint
        const midpoint = Point.multiplyScalar(this.#midpoint, zoneTileSize)
        const midZoneCanvasPoint = Point.plus(canvasPoint, midpoint)

        canvas.rect(midZoneCanvasPoint, zoneTileSize, '#000')
    }

    drawZoneTiles(props, zoneSize, zoneTileSize) {
        const { canvas, tilePoint, canvasPoint, world, zone } = props
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
                    } else {
                        canvas.outline(zoneCanvasPoint, zoneTileSize, outline, '#1d2255')
                    }
                }
            }
        }
    }
}


function connectPoints(p1, p2) {
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    const points = [];
    let x = x1, y = y1;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const stepX = Math.sign(dx);
    const stepY = Math.sign(dy);

    while (x !== x2 || y !== y2) {
        if (x !== x2 && y !== y2) {
            x += stepX;
            y += stepY;
        } else if (x !== x2) {
            x += stepX;
        } else if (y !== y2) {
            y += stepY;
        }
        points.push([x, y]);
    }
    return points;
}