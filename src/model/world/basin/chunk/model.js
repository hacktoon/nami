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
export const TYPE_RIVER = 3
export const TYPE_CHANNEL = 4
export const TYPE_MARGIN = 5
export const TYPE_SHORE = 6


export function buildModel(baseContext) {
    const { chunkRect } = baseContext
    const chunkMidpoint = buildChunkMidpoint(baseContext.chunkRect)
    const routes = buildRoutes({ ...baseContext, chunkMidpoint })
    // const blockedMaskGrid = buildNoiseMaskGrid(baseContext)
    let pointMaskMap = buildErosionPoints(routes, baseContext)
    // if(baseContext.worldPoint[0] == 16 && baseContext.worldPoint[1] == 17) {
    //     pointMaskMap = buildErosionPoints2(routes, baseContext)
    // }
    // const regionModel = buildRegionModel(baseContext)
    const context = { ...baseContext, pointMaskMap }
    const baseGrid = buildBaseGrid(context)
    const marginGrid = buildMarginGrid(baseGrid, context)
    return {
        // blocked: blockedMaskGrid,
        grid: marginGrid,
        chunkMidpoint,
        // regionModel,
        routes
    }
}


function buildNoiseMaskGrid(context) {
    const { world, worldPoint, rect, chunkRect } = context
    const relativePoint = Point.multiplyScalar(worldPoint, chunkRect.width)
    const noiseRect = Rect.multiply(rect, chunkRect.width)
    return Grid.fromRect(chunkRect, chunkPoint => {
        const noisePoint = Point.plus(relativePoint, chunkPoint)
        const noise = world.noise.get4DChunkGrained(noiseRect, noisePoint)
        return noise > BLOCKED_NOISE_RATE
    })
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
    const { world, worldPoint, chunk, chunkMidpoint } = baseContext
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
    // map each cell to LAND/WATER or RIVER/CURRENT if it has a path
    const { world, worldPoint, chunk, chunkRect } = context
    const { pointMaskMap } = context
    const isWorldLand = world.surface.isLand(worldPoint)
    return Grid.fromRect(chunkRect, chunkPoint => {
        if (pointMaskMap.has(chunkPoint)) {
            return isWorldLand ? TYPE_RIVER : TYPE_CHANNEL
        }
        const isChunkLand = chunk.surface.isLand(chunkPoint)
        return isChunkLand ? TYPE_LAND : TYPE_WATER
    })
}


function buildMarginGrid(baseGrid, context) {
    const { world, worldPoint, chunk, chunkRect, chunkSize } = context
    const marginPoints = new PointSet(chunkRect)
    const shorePoints = new PointSet(chunkRect)
    // post process to add margins and shores to some chunk points
    const basin = world.basin.get(worldPoint)
    // get chunk corner point based on direction: NORTHWEST = [0, 0]
    const getCornerPoint = (dir) => dir.axis.map(coord => coord > 0 ? chunkSize - 1 : 0)
    // check river/water chunk corners for grid building
    for (let dir of basin.waterCornerBitmap) {
        shorePoints.add(getCornerPoint(dir))
    }
    for (let dir of basin.riverCornerBitmap) {
        const cornerPoint = getCornerPoint(dir)
        marginPoints.add(cornerPoint)
        // mark a 1x1 cross on this corner point
        for (let sidePoint of Point.adjacents(cornerPoint)) {
            if (chunkRect.isInside(sidePoint))
                marginPoints.add(sidePoint)
        }
    }
    // Apply erosion margins to base grid
    const buildMargin = (chunkPoint) => {
        const type = baseGrid.get(chunkPoint)
        // Apply margins only on land/water without borders
        if (type != TYPE_LAND && type != TYPE_WATER) {
            return type
        }
        for (let sidePoint of Point.around(chunkPoint)) {
            const inside = chunkRect.isInside(sidePoint)
            const type = baseGrid.get(sidePoint)
            if (inside && type == TYPE_RIVER)
                return TYPE_MARGIN
        }
        for (let sidePoint of Point.adjacents(chunkPoint)) {
            const inside = chunkRect.isInside(sidePoint)
            const type = baseGrid.get(sidePoint)
            if (inside && type == TYPE_CHANNEL)
                return TYPE_SHORE
        }
        // set margins of erosion points
        if (marginPoints.has(chunkPoint)) {
            return TYPE_MARGIN
        }
        if (shorePoints.has(chunkPoint)) return TYPE_SHORE
        const isBorder = chunk.surface.isBorder(chunkPoint)
        if (chunk.surface.isLand(chunkPoint))
            return isBorder ? TYPE_MARGIN : TYPE_LAND
        return isBorder ? TYPE_SHORE : TYPE_WATER
    }

    return Grid.fromRect(chunkRect, buildMargin)
}


function buildErosionPoints(routes, context) {
    // reads the direction bitmask data and create points for chunk grid
    const { chunkRect, worldPoint } = context
    const points = new PointMap(chunkRect)
    for (let { source, target, direction } of routes) {
        midpointDisplacement(worldPoint, chunkRect, source, target, MEANDER, point => {
            points.set(point, TYPE_RIVER)
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
//         pointMap.set(currentPoint, TYPE_RIVER)
//         prevPoint = currentPoint
//         currentPoint = getNextPoint(prevPoint, currentPoint, target, pointMap, context)
//         if (pointMap.has(currentPoint) && !isOutflow) {
//             return
//         }
//         maxIter--
//     }
//     pointMap.set(currentPoint, TYPE_RIVER)
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
