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
    const routes = buildRoutes(baseContext)
    const pointMaskMap = buildPointMaskMap(baseContext)
    const regionModel = buildRegionModel(baseContext)
    const context = { ...baseContext, regionModel, pointMaskMap }
    const baseGrid = buildBaseGrid(context)
    const marginGrid = buildMarginGrid(baseGrid, context)
    return {
        // grid: baseGrid,
        grid: marginGrid,
        regionModel,
        routes
    }
}


function buildBaseGrid(context) {
    // map each cell to LAND/WATER or RIVER/CURRENT if it has a path
    const { world, worldPoint, chunk, chunkRect } = context
    const { pointMaskMap } = context
    const isWorldLand = world.surface.isLand(worldPoint)
    return Grid.fromRect(chunkRect, chunkPoint => {
        if (pointMaskMap.has(chunkPoint)) {
            return isWorldLand ? TYPE_RIVER : TYPE_CURRENT
        }
        const isLand = chunk.surface.isLand(chunkPoint)
        return isLand ? TYPE_LAND : TYPE_WATER
    })
}

function buildMarginGrid(baseGrid, context) {
    const { world, worldPoint, chunkRect, chunkSize } = context
    const marginPoints = new PointSet(chunkRect)
    const shorePoints = new PointSet(chunkRect)
    // post process to add margins and shores to some chunk points
    const basin = world.basin.get(worldPoint)
    // get chunk corner point based on direction
    const getCornerPoint = (dir) => dir.axis.map(coord => coord > 0 ? chunkSize - 1 : 0)
    // check river/water chunk corners for grid building
    for (let dir of basin.waterCornerBitmap) {
        shorePoints.add(getCornerPoint(dir))
    }
    for (let dir of basin.riverCornerBitmap) {
        marginPoints.add(getCornerPoint(dir))
    }
    // apply margin/shores to grid
    return Grid.fromRect(chunkRect, chunkPoint => {
        const type = baseGrid.get(chunkPoint)
        if (type == TYPE_LAND || type == TYPE_WATER) {
            if (marginPoints.has(chunkPoint)) return TYPE_MARGIN
            if (shorePoints.has(chunkPoint)) return TYPE_SHORE
        }
        return type
    })
    // const isBorder = chunk.surface.isBorder(chunkPoint)
    // if (chunk.surface.isLand(chunkPoint))
    //             return isBorder ? TYPE_MARGIN : TYPE_LAND
    //         return isBorder ? TYPE_SHORE : TYPE_WATER

    // set margins of erosion points
    // Point.adjacents(chunkPoint, sidePoint => {
    //     if (chunkRect.isInside(sidePoint)) {
    //         const points = isWorldLand ? marginPoints : shorePoints
    //         points.add(sidePoint)
    //     }
    // })
}



function buildRoutes(baseContext) {
    // Each chunk has gates on its sides. A gate connect two chunks
    // and is the same for both by averaging its joints
    const { world, worldPoint, chunk } = baseContext
    const basin = world.basin.get(worldPoint)
    const routes = []
    for (let gateDirection of basin.directionBitmap) {
        const parentPoint = Point.atDirection(worldPoint, gateDirection)
        const sideBasin = world.basin.get(parentPoint)
        // get the point on chunk side
        const avgJoint = Math.floor((basin.joint + sideBasin.joint) / 2)
        // create point at chunk edge where it connects to neighbor chunk
        const gatePoint = gateDirection.axis.map(coord => {
            if (coord < 0) return 0
            if (coord > 0) return chunk.size - 1
            return avgJoint
        })
        // current gate is same as the basin flow, so route is from midpoint to gate
        const isOutflowGate = basin.erosion.id == gateDirection.id
        const source = isOutflowGate ? basin.midpoint : gatePoint
        const target = isOutflowGate ? gatePoint : basin.midpoint
        // route direction
        const direction = isOutflowGate ? basin.erosion : sideBasin.erosion
        routes.push({ source, target, direction })
    }
    return routes
}


function buildPointMaskMap(baseContext) {
    // reads the direction bitmask data and create points for chunk grid
    const { world, worldPoint, chunk, chunkRect } = baseContext
    const pointMaskMap = new PointMap(chunkRect)
    const basin = world.basin.get(worldPoint)
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
        midpointDisplacement(chunkRect, source, target, MEANDER, point => {
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

