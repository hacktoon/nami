import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { Point } from '/src/lib/math/point'
import { Rect } from '/src/lib/math/rect'
import { PointMap } from '/src/lib/math/point/map'
import { PointSet } from '/src/lib/math/point/set'
import { Direction } from '/src/lib/math/direction'
import { Random } from '/src/lib/random'
import { Grid } from '/src/lib/grid'

import { buildRegionModel } from './region'


const BLOCKED_NOISE_RATE = .5
const MIDDLE_OFFSET = 1  // used to avoid midpoints on middle
const MIDPOINT_RATE = .4  // random point in 40% of chunkrect area around center point
const MEANDER = 3

export const TYPE_LAND = 1
export const TYPE_WATER = 2
export const TYPE_EROSION = 3
export const TYPE_CHANNEL = 4
export const TYPE_EROSION_SIDE = 5
export const TYPE_CHANNEL_SIDE = 6


export function buildModel(baseContext) {
    const { chunkRect } = baseContext
    const routes = buildRoutes(baseContext)
    const erosionPoints = buildErosionPoints(routes, baseContext)
    // const regionModel = buildRegionModel(baseContext)
    const context = { ...baseContext, erosionPoints }
    const baseGrid = buildBaseGrid(context)
    const cornerMargins = buildCornerMargins(baseGrid, context)
    const typeGrid = buildTypeGrid(baseGrid, { ...context, ...cornerMargins })
    return {
        type: baseGrid,
        routes
        // regionModel,
        // blocked: blockedMaskGrid,
    }
}




function buildChunkMidpoint(chunkRect) {
    const centerIndex = Math.floor(chunkRect.width / 2)
    // select random point in 60% of chunkrect area around center point
    const offset = Math.floor(centerIndex * MIDPOINT_RATE)
    const randX = Random.int(-offset, offset)
    const randY = Random.int(-offset, offset)
    // random offset distance from center
    const midRandX = Random.choice(-MIDDLE_OFFSET, MIDDLE_OFFSET)
    const midRandY = Random.choice(-MIDDLE_OFFSET, MIDDLE_OFFSET)
    // add some variation to center index
    const x = centerIndex + (randX != 0 ? randX : midRandX)
    const y = centerIndex + (randY != 0 ? randY : midRandY)
    return [x, y]
}


function buildRoutes(baseContext) {
    // Each chunk has gates on its sides. A gate connects two chunks
    // and is the same for both by averaging its joints
    const { world, worldPoint, chunk, chunkRect } = baseContext
    const chunkMidpoint = buildChunkMidpoint(chunkRect)
    const basin = world.basin.get(worldPoint)
    const routes = []
    for (let gateDirection of basin.directionBitmap) {
        const parentPoint = Point.atDirection(worldPoint, gateDirection)
        const sideBasin = world.basin.get(parentPoint)
        // get the point on chunk side
        const avgJoint = Math.floor((basin.joint + sideBasin.joint) / 2)
        // create point at chunk edge where it connects to neighbor chunk
        const gatePoint = gateDirection.axis.map(coord => {
            if (coord < 0) return 0  // -1 means NORTH or EAST
            if (coord > 0) return chunk.size - 1  // +1 means SOUTH or WEST
            return avgJoint  //  0 means any value at chunk side
        })
        // current gate is same as the basin flow, so route is from midpoint to gate
        const isOutflow = basin.erosion.id == gateDirection.id
        const source = isOutflow ? chunkMidpoint : gatePoint
        const target = isOutflow ? gatePoint : chunkMidpoint
        // route direction
        const direction = isOutflow ? basin.erosion : sideBasin.erosion
        routes.push({ source, target, direction, isOutflow })
    }
    return routes
}


function buildBaseGrid(context) {
    // map each cell to LAND/WATER or EROSION/CHANNEL if it has a path
    const { world, worldPoint, chunk, chunkRect } = context
    const { erosionPoints } = context
    const isWorldLand = world.surface.isLand(worldPoint)
    const isWorldBorder = world.surface.isBorder(worldPoint)
    return Grid.fromRect(chunkRect, chunkPoint => {
        const isChunkLand = chunk.surface.isLand(chunkPoint)
        if (erosionPoints.has(chunkPoint)) {
            return isWorldLand ? TYPE_EROSION : TYPE_CHANNEL
        }
        return isChunkLand ? TYPE_LAND : TYPE_WATER
    })
}


function buildCornerMargins(baseGrid, context) {
    // Add channel/river margins to some chunk corner points
    const { world, worldPoint, chunk, chunkRect, chunkSize } = context
    const erosionSidePoints = new PointSet(chunkRect)
    const channelSidePoints = new PointSet(chunkRect)
    const basin = world.basin.get(worldPoint)
    // get chunk corner point based on direction: NORTHWEST = [0, 0]
    const getCornerPoint = (dir) => dir.axis.map(coord => coord > 0 ? chunkSize - 1 : 0)
    // check river/water chunk corners checking for rivers/channels in that corner
    for (let dir of basin.waterCornerBitmap) {
        channelSidePoints.add(getCornerPoint(dir))
    }
    for (let dir of basin.riverCornerBitmap) {
        const cornerPoint = getCornerPoint(dir)
        erosionSidePoints.add(cornerPoint)
        // mark a 1x1 cross on this corner point to avoid water "leaking"
        for (let sidePoint of Point.adjacents(cornerPoint)) {
            if (chunkRect.isInside(sidePoint))
                erosionSidePoints.add(sidePoint)
        }
    }
    return { erosionSidePoints, channelSidePoints }
}


function buildTypeGrid(baseGrid, context) {
    // Add channel/river margins to some chunk corner points
    const { world, worldPoint, chunk, chunkRect, chunkSize } = context
    const { erosionSidePoints, channelSidePoints } = context
    // Apply erosion margins to base grid
    return Grid.fromRect(chunkRect, (chunkPoint) => {
        const type = baseGrid.get(chunkPoint)
        // Apply margins only on land/water without borders
        if (type != TYPE_LAND && type != TYPE_WATER) {
            return type
        }
        // set margins of erosion points
        if (erosionSidePoints.has(chunkPoint)) return TYPE_EROSION_SIDE
        if (channelSidePoints.has(chunkPoint)) return TYPE_CHANNEL_SIDE
        for (let sidePoint of Point.around(chunkPoint)) {
            const inside = chunkRect.isInside(sidePoint)
            const type = baseGrid.get(sidePoint)
            if (inside && type == TYPE_EROSION)
                return TYPE_EROSION_SIDE
        }
        for (let sidePoint of Point.adjacents(chunkPoint)) {
            const inside = chunkRect.isInside(sidePoint)
            const type = baseGrid.get(sidePoint)
            if (inside && type == TYPE_CHANNEL)
                return TYPE_CHANNEL_SIDE
        }
        return type
    })
}


function buildErosionPoints(routes, context) {
    // reads the direction bitmask data and create points for chunk grid
    const { chunkRect, worldPoint } = context
    const points = new PointMap(chunkRect)
    for (let { source, target, direction } of routes) {
        midpointDisplacement(worldPoint, chunkRect, source, target, MEANDER, point => {
            points.set(point, TYPE_EROSION)
        })
    }
    return points
}


// function setHalfPath(source, target, pointMap, route, context) {
//     const { direction, isOutflow } = route
//     let currentPoint = source
//     let prevPoint = source
//     let maxIter = 100  // avoid infinite loops
//     while (Point.differs(currentPoint, target) && maxIter > 0) {
//         pointMap.set(currentPoint, TYPE_EROSION)
//         prevPoint = currentPoint
//         currentPoint = getNextPoint(prevPoint, currentPoint, target, pointMap, context)
//         if (pointMap.has(currentPoint) && !isOutflow) {
//             return
//         }
//         maxIter--
//     }
//     pointMap.set(currentPoint, TYPE_EROSION)
// }


// function getNextPoint(prevPoint, currentPoint, target, pointMap, context) {
//     const { chunkRect } = context
//     const [sx, sy] = currentPoint
//     const [tx, ty] = target
//     const candidates = []
//     const add = (dir) => {
//         // avoid adding points on edges
//         const candidate = Point.atDirection(currentPoint, dir)
//         if (Point.differs(candidate, target) && chunkRect.isEdge(candidate)) {
//             // avoid electing a point in edge, except for the target
//             return
//         }
//         candidates.push(candidate)
//     }
//     if (sx < tx) add(Direction.EAST)
//     if (sx > tx) add(Direction.WEST)
//     if (sy < ty) add(Direction.SOUTH)
//     if (sy > ty) add(Direction.NORTH)
//     if (sx < tx && sy < ty) add(Direction.SOUTHEAST)
//     if (sx > tx && sy < ty) add(Direction.SOUTHWEST)
//     if (sx < tx && sy > ty) add(Direction.NORTHEAST)
//     if (sx > tx && sy > ty) add(Direction.NORTHWEST)
//     return Random.choiceFrom(candidates)
// }

// function buildNoiseMaskGrid(context) {
//     const { world, worldPoint, rect, chunkRect } = context
//     const relativePoint = Point.multiplyScalar(worldPoint, chunkRect.width)
//     const noiseRect = Rect.multiply(rect, chunkRect.width)
//     return Grid.fromRect(chunkRect, chunkPoint => {
//         const noisePoint = Point.plus(relativePoint, chunkPoint)
//         const noise = world.noise.get4DChunkGrained(noiseRect, noisePoint)
//         return noise > BLOCKED_NOISE_RATE
//     })
// }