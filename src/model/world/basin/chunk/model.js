import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { Point } from '/src/lib/math/point'
import { Rect } from '/src/lib/math/rect'
import { PointSet } from '/src/lib/math/point/set'
import { Direction } from '/src/lib/math/direction'
import { Random } from '/src/lib/random'
import { Grid } from '/src/lib/grid'

import { buildRegionModel } from './region'
import { buildErosionGatePoints } from './route'


const BLOCKED_NOISE_RATE = .5
const MEANDER = 5

export const TYPE_LAND = 1
export const TYPE_WATER = 2
export const TYPE_EROSION = 3
export const TYPE_CHANNEL = 4
export const TYPE_EROSION_SIDE = 5
export const TYPE_CHANNEL_SIDE = 6


export function buildModel(baseContext) {
    const gates = buildErosionGatePoints(baseContext)
    const landBorders = buildLandBorders(baseContext)
    const erosionPoints = buildErosionMask(gates, baseContext)
    const cornerMargins = buildCornerMargins(baseContext)
    const typeGrid = buildTypeGrid(cornerMargins, landBorders, baseContext)
    return {
        type: typeGrid,
        erosion: erosionPoints,
        gates
    }
}


function buildLandBorders(context) {
    // detect land borders
    const { world, worldPoint, chunk, chunkRect } = context
    const isWorldLand = world.surface.isLand(worldPoint)
    // const isWorldBorder = world.surface.isBorder(worldPoint)
    const landBorderPoints = new PointSet(chunkRect)
    Grid.fromRect(chunkRect, chunkPoint => {
        // will read only land points
        if (chunk.surface.isLand(chunkPoint)) {
            for (let sidePoint of Point.adjacents(chunkPoint)) {
                // check for any water neighbors
                if (! chunk.surface.isLand(sidePoint)) {
                    landBorderPoints.add(sidePoint)
                    return
                }
            }
        }
    })
    return landBorderPoints
}


function buildCornerMargins(context) {
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


function buildErosionMask(gates, context) {
    // reads the direction bitmask data and create points for chunk grid
    const { chunk, chunkRect, worldPoint } = context
    const points = new PointSet(chunkRect)
    for (let {source, target} of gates) {
        midpointDisplacement(chunkRect, source, target, MEANDER, point => {
            points.add(point)
        })
    }
    return points
}


function buildErosionPath(gates, erosionPoints, context) {
    // reads the direction bitmask data and create points for chunk grid
    const { chunk, chunkRect, worldPoint } = context
    for (let {source, target, isOutflow} of gates) {

    }
    return points
}


function buildTypeGrid(cornerMargins, landBorders, context) {
    // Add channel/river margins to some chunk corner points
    const { world, worldPoint, chunk, chunkRect, chunkSize } = context
    const { erosionSidePoints, channelSidePoints } = cornerMargins
    // Apply erosion margins to base grid
    return Grid.fromRect(chunkRect, (chunkPoint) => {
        const isLand = chunk.surface.isLand(chunkPoint)
        // Apply margins only on land/water without borders
        if (isLand) return TYPE_LAND
        else return TYPE_WATER

        // set margins of erosion points
        // if (erosionSidePoints.has(chunkPoint)) return TYPE_EROSION_SIDE
        // if (channelSidePoints.has(chunkPoint)) return TYPE_CHANNEL_SIDE
        // for (let sidePoint of Point.around(chunkPoint)) {
        //     const inside = chunkRect.isInside(sidePoint)
        //     const type = landBorders.get(sidePoint)
        //     if (inside && type == TYPE_EROSION)
        //         return TYPE_EROSION_SIDE
        // }
        // for (let sidePoint of Point.adjacents(chunkPoint)) {
        //     const inside = chunkRect.isInside(sidePoint)
        //     const type = landBorders.get(sidePoint)
        //     if (inside && type == TYPE_CHANNEL)
        //         return TYPE_CHANNEL_SIDE
        // }
        // return type
    })
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