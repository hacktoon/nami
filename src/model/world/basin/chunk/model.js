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
const MIDDLE_OFFSET = 1  // used to avoid midpoints on middle
const MIDPOINT_RATE = .4  // random point in 40% of chunkrect area around center point


export function buildModel(baseContext) {
    const routes = buildRoutes(baseContext)
    const pointMaskMap = buildErosionPoints(routes, baseContext)
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


function buildMidpoint(chunkRect) {
    const centerIndex = Math.floor(chunkRect.width / 2)
    // select random point in 60% of chunkrect area around center point
    const offset = Math.floor(centerIndex * MIDPOINT_RATE)
    const randX = Random.int(-offset, offset)
    const randY = Random.int(-offset, offset)
    // random offset distance from center
    const midRandX = Random.choice(-MIDDLE_OFFSET, MIDDLE_OFFSET)
    const midRandY = Random.choice(-MIDDLE_OFFSET, MIDDLE_OFFSET)
    const x = centerIndex + (randX != 0 ? randX : midRandX)
    const y = centerIndex + (randY != 0 ? randY : midRandY)
    return [x, y]
}


function buildMarginGrid(baseGrid, context) {
    const { world, worldPoint, chunk, chunkRect, chunkSize } = context
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
    // Apply erosion margins to base grid
    return Grid.fromRect(chunkRect, chunkPoint => {
        const type = baseGrid.get(chunkPoint)
        // Apply margins only on land/water without borders
        if (type == TYPE_LAND || type == TYPE_WATER) {
            for (let sidePoint of Point.around(chunkPoint)) {
                const inside = chunkRect.isInside(sidePoint)
                const type = baseGrid.get(sidePoint)
                if (inside && type == TYPE_RIVER) return TYPE_MARGIN
            }
            for (let sidePoint of Point.adjacents(chunkPoint)) {
                const inside = chunkRect.isInside(sidePoint)
                const type = baseGrid.get(sidePoint)
                if (inside && type == TYPE_CURRENT) return TYPE_SHORE
            }
            // set margins of erosion points
            if (marginPoints.has(chunkPoint)) return TYPE_MARGIN
            if (shorePoints.has(chunkPoint)) return TYPE_SHORE
            const isBorder = chunk.surface.isBorder(chunkPoint)
            if (chunk.surface.isLand(chunkPoint))
                return isBorder ? TYPE_MARGIN : TYPE_LAND
            return isBorder ? TYPE_SHORE : TYPE_WATER
        }
        return type
    })
}


function buildRoutes(baseContext) {
    // Each chunk has gates on its sides. A gate connect two chunks
    // and is the same for both by averaging its joints
    const { world, worldPoint, chunk, chunkRect } = baseContext
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
        const midpoint = buildMidpoint(chunkRect)
        // current gate is same as the basin flow, so route is from midpoint to gate
        const isOutflowGate = basin.erosion.id == gateDirection.id
        const source = isOutflowGate ? midpoint : gatePoint
        const target = isOutflowGate ? gatePoint : midpoint
        // route direction
        const direction = isOutflowGate ? basin.erosion : sideBasin.erosion
        routes.push({ source, target, direction })
    }
    return routes
}


function buildErosionPoints(routes, baseContext) {
    // reads the direction bitmask data and create points for chunk grid
    const { chunkRect } = baseContext
    const points = new PointMap(chunkRect)
    for (let {source, target, direction} of routes) {
        midpointDisplacement(chunkRect, source, target, MEANDER, point => {
            points.set(point, TYPE_RIVER)
        })
    }
    return points
}
