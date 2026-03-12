import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { Point } from '/src/lib/geometry/point'
import { PointMap } from '/src/lib/geometry/point/map'
import { PointSet } from '/src/lib/geometry/point/set'
import { Random } from '/src/lib/random'
import { Grid } from '/src/lib/grid'


import { buildRegionModel } from './region'


const MEANDER = 3

export const TYPE_LAND = 1
export const TYPE_WATER = 2
export const TYPE_RIVER = 3
export const TYPE_CURRENT = 4
export const TYPE_MARGIN = 5
export const TYPE_SHORE = 6


export function buildModel(baseContext) {
    const { chunkRect } = baseContext
    const pointMaskMap = buildPointMaskMap(baseContext)
    const regionModel = buildRegionModel(baseContext)
    const marginPoints = new PointSet(chunkRect)
    const shorePoints = new PointSet(chunkRect)
    const context = {
        ...baseContext, regionModel, pointMaskMap, marginPoints, shorePoints
    }
    const baseGrid = buildBaseGrid(context)
    return {
        grid: buildMarginGrid(context, baseGrid),
        regionModel,
    }
}


function buildBaseGrid(context) {
    // map each cell to LAND/WATER or RIVER/CURRENT if it has a path
    const { world, worldPoint, chunk, chunkRect } = context
    const { marginPoints, shorePoints, pointMaskMap } = context
    const isWorldLand = world.surface.isLand(worldPoint)
    return Grid.fromRect(chunkRect, chunkPoint => {
        const isEroded = pointMaskMap.has(chunkPoint)
        // no erosion
        if (! isEroded)
            return chunk.surface.isLand(chunkPoint) ? TYPE_LAND : TYPE_WATER
        // discover erosion path value
        if (isWorldLand) {
            // set erosion margins
            Point.around(chunkPoint, sidePoint => {
                if (chunkRect.isInside(sidePoint)) {
                    marginPoints.add(sidePoint)
                }
            })
            return TYPE_RIVER
        } else {
            // water paths
            Point.adjacents(chunkPoint, sidePoint => {
                if (chunkRect.isInside(sidePoint)) {
                    shorePoints.add(sidePoint)
                }
            })
            return TYPE_CURRENT
        }
    })
}

function buildMarginGrid(context, baseGrid) {
    const { world, worldPoint, chunkRect } = context
    const { marginPoints, shorePoints  } = context
    const isWorldLand = world.surface.isLand(worldPoint)
    const getSidePoints = isWorldLand ? Point.around : Point.adjacents
    // post process to add margins and shores to some chunk points
    const basin = world.basin.get(worldPoint)
    // check river/water chunk corners for grid building
    setCorners(chunkRect, basin.riverCornerBitmap, marginPoints)
    setCorners(chunkRect, basin.waterCornerBitmap, shorePoints)
    return Grid.fromRect(chunkRect, chunkPoint => {
        const type = baseGrid.get(chunkPoint)
        if (type == TYPE_LAND || type == TYPE_WATER) {
            if (marginPoints.has(chunkPoint)) return TYPE_MARGIN
            if (shorePoints.has(chunkPoint)) return TYPE_SHORE
        }
        return type
    })
}


function setCorners(chunkRect, directions, collection) {
    const size = chunkRect.width
    for (let dir of directions) {
        const chunkCornerPoint = dir.axis.map(coord => coord > 0 ? size-1 : 0)
        // mark a cross at corner point
        Point.adjacents(chunkCornerPoint, sidePoint => {
            if (chunkRect.isInside(sidePoint))
                collection.add(sidePoint)
        })
        collection.add(chunkCornerPoint)
    }
}

function buildPointMaskMap(baseContext) {
    // reads the direction bitmask data and create points for chunk grid
    const { world, worldPoint, chunk, chunkRect } = baseContext
    const pointMaskMap = new PointMap(chunkRect)
    const basin = world.basin.get(worldPoint)
    const midSize = Math.floor(chunk.size / 2)
    const source = basin.midpoint
    for (let direction of basin.directionBitmap) {
        const parentPoint = Point.atDirection(worldPoint, direction)
        const sideBasin = world.basin.get(parentPoint)
        const avgJoint = Math.floor((basin.joint + sideBasin.joint) / 2)
        const target = direction.axis.map(coord => {
            if (coord < 0) return 0
            if (coord > 0) return chunk.size - 1
            return avgJoint
        })
        const distance = Point.distance(source, target)
        const pointsTooClose = distance < midSize
        const distortion = pointsTooClose ? 2 : MEANDER
        midpointDisplacement(chunkRect, source, target, distortion, point => {
            pointMaskMap.set(point, TYPE_RIVER)
        })
    }
    return pointMaskMap
}


function generateFlowPath(context, source, target, direction) {
    const { chunkRect, pointMaskMap } = context
    const deltaX = Math.abs(source[0] - target[0])
    const deltaY = Math.abs(source[1] - target[1])
    const fixedAxis = deltaX > deltaY ? 0 : 1  // 0 for x, 1 for y
    const displacedAxis = fixedAxis === 0 ? 1 : 0
    // distance between source and target to fill with path
    const size = Math.abs(target[fixedAxis] - source[fixedAxis])
    const points = [source]
    let current = source
    pointMaskMap.set(target, direction.id)
    const [tx, ty] = target
    while (Point.differs(current, target)) {
        let [x, y] = current
        const [cx, cy] = current
        if (Random.chance(.8))
            x = cx > tx ? cx - 1 : (cx < tx ? cx + 1 : cx)
        if (Random.chance(.8))
            y = cy > ty ? cy - 1 : (cy < ty ? cy + 1 : cy)
        current = [x, y]
        pointMaskMap.set(current, direction.id)
    }
    return points
}

