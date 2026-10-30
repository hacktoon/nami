import { Point } from '/src/lib/math/point'
import { PointSet } from '/src/lib/math/point/set'
import { Direction } from '/src/lib/math/direction'
import { Rect } from '/src/lib/math/rect'
import { Random } from '/src/lib/random'
import { Grid } from '/src/lib/grid'

import { buildErosionGatePoints, buildErosionPoints } from './gate'
import { buildRegionModel } from './region'


export const TYPE_LAND = 1
export const TYPE_WATER = 2
export const TYPE_EROSION = 3
export const TYPE_CHANNEL = 4
export const TYPE_EROSION_SIDE = 5
export const TYPE_CHANNEL_SIDE = 6


export function buildModel(context) {
    const gates = buildErosionGatePoints(context)
    const erosionPoints = buildErosionPoints(gates, context)
    const rivers = buildRivers(gates, erosionPoints, context)
    // const landBorders = buildLandBorders(context)
    // const cornerMargins = buildCornerMargins(context)
    const type = buildTypeGrid(erosionPoints, context)
    return { type, erosion: erosionPoints, gates }
}


function buildLandBorders(context) {
    // detect land borders
    const { world, worldPoint, chunk, chunkRect } = context
    const isWorldLand = world.surface.isLand(worldPoint)
    // const isWorldBorder = world.surface.isBorder(worldPoint)
    const landBorderPoints = new PointSet(chunkRect)
    Grid.fromRect(chunkRect, chunkPoint => {
        // will read only land points
        if (chunk.surface.isWater(chunkPoint)) return
        for (let sidePoint of Point.adjacents(chunkPoint)) {
            // check for any water neighbors
            if (!chunk.surface.isLand(sidePoint)) {
                landBorderPoints.add(sidePoint)
                return
            }
        }
    })
    return landBorderPoints
}


// function buildCornerMargins(context) {
//     // Add channel/river margins to some chunk corner points
//     const { world, worldPoint, chunk, chunkRect, chunkSize } = context
//     const erosionSidePoints = new PointSet(chunkRect)
//     const channelSidePoints = new PointSet(chunkRect)
//     const basin = world.basin.get(worldPoint)
//     // get chunk corner point based on direction: NORTHWEST = [0, 0]
//     const getCornerPoint = (dir) => dir.axis.map(coord => coord > 0 ? chunkSize - 1 : 0)
//     // check river/water chunk corners checking for rivers/channels in that corner
//     for (let dir of basin.waterCorner) {
//         channelSidePoints.add(getCornerPoint(dir))
//     }
//     for (let dir of basin.riverCorner ) {
//         const cornerPoint = getCornerPoint(dir)
//         erosionSidePoints.add(cornerPoint)
//         // mark a 1x1 cross on this corner point to avoid water "leaking"
//         for (let sidePoint of Point.adjacents(cornerPoint)) {
//             if (chunkRect.isInside(sidePoint))
//                 erosionSidePoints.add(sidePoint)
//         }
//     }
//     return { erosionSidePoints, channelSidePoints }
// }


function buildRivers(gates, erosionPoints, context) {
    // reads the direction bitmask data and create points for chunk grid
    const { world, chunk, chunkRect, worldPoint } = context
    // map the chunk river gates by direction
    const gateMap = new Map(gates.map(gate => [gate.direction.id, gate]))
    if(worldPoint[0] == 37 && worldPoint[1] == 37) {
        for (let river of world.basin.getRivers(worldPoint)) {
            const { direction } = river
            const gate = gateMap.get(direction.id)
            buildRiverStretch(gate, river, erosionPoints, context)
        }
    }
    return
}


function buildRiverStretch(gate, river, erosionPoints, context) {
    // reads the direction bitmask data and create points for chunk grid
    const { chunk, chunkRect, worldPoint } = context
    const { source, target, direction, isOutflow } = gate
    let currentPoint = source
    let prevPoint = source
    let maxIter = 1000  // avoid infinite loops
    while (true || maxIter > 0) {
        prevPoint = currentPoint
        currentPoint = getNextPoint(currentPoint, target, erosionPoints)
        --maxIter
        console.log(maxIter, direction.name, prevPoint, ' => ', currentPoint, ' => ', target)
        try {
            if (Point.equals(currentPoint, target))
                break
        } catch (error) {
            console.log('ERROR', direction.name, currentPoint, target)
            return
        }
    }
}


function getNextPoint(source, target, erosionPoints) {
    const [sx, sy] = source
    const [tx, ty] = target
    const candidates = []
    const add = (direction) => {
        const candidate = Point.atDirection(source, direction)
        // console.log(candidate, source);
        // console.log('candidate:', candidate, erosionPoints.has(candidate))
        const notReached = Point.differs(candidate, target)
        const insideErosionPath = erosionPoints.has(candidate)
        if (insideErosionPath && notReached) {
            candidates.push(candidate)
        }
    }
    if (sx < tx) add(Direction.EAST)
    if (sx > tx) add(Direction.WEST)
    if (sy < ty) add(Direction.SOUTH)
    if (sy > ty) add(Direction.NORTH)
    if (sx < tx && sy < ty) add(Direction.SOUTHEAST)
    if (sx > tx && sy < ty) add(Direction.SOUTHWEST)
    if (sx < tx && sy > ty) add(Direction.NORTHEAST)
    if (sx > tx && sy > ty) add(Direction.NORTHWEST)
    return Random.choiceFrom(candidates)
}



function buildTypeGrid(erosionPoints, context) {
    // Add channel/river margins to some chunk corner points
    const { world, worldPoint, chunk, chunkRect, chunkSize } = context
    // const { erosionSidePoints, channelSidePoints } = cornerMargins
    // Apply erosion margins to base grid
    return Grid.fromRect(chunkRect, (chunkPoint) => {
        const isLand = chunk.surface.isLand(chunkPoint)
        // Apply margins only on land/water without borders
        if (isLand) return TYPE_LAND
        return TYPE_WATER

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