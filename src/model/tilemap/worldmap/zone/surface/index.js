import { Point } from '/src/lib/geometry/point'
import { Direction } from '/src/lib/direction'
import { Grid } from '/src/lib/grid'
import { Rect } from '/src/lib/geometry/rect'

import {
    Surface,
    LakeSurface,
    SeaSurface,
    OceanSurface,
    IslandSurface,
    ContinentSurface,
    LakeBorderSurface,
    SeaBorderSurface,
    OceanBorderSurface,
    IslandBorderSurface,
    ContinentBorderSurface,
} from '../../world/surface/type'


export class SurfaceZone {
    #grid

    constructor(context) {
        this.size = context.zoneSize
        this.zone = context.zone
        this.world = context.world
        this.#grid = buildGrid(context)
    }

    get(point) {
        const surfaceId = this.#grid.get(point)
        return Surface.parse(surfaceId)
    }

    draw(props, params) {
        const {canvas, tilePoint, canvasPoint, tileSize, world, zone} = props
        const zoneSize = zone.surface.size
        const size = tileSize / zoneSize
        // render zone tiles
        const showRiver = params.get('showRivers') && tileSize >= 8
        const river = world.river.get(tilePoint)
        for (let x=0; x < zoneSize; x++) {
            const xSize = x * size
            for (let y=0; y < zoneSize; y++) {
                const zonePoint = [y, x]
                const ySize = y * size
                const zoneCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const zoneSurface = zone.surface.get(zonePoint)
                let color = zoneSurface.color
                if (world.surface.isBorder(tilePoint)) {
                    color = color.darken(20)
                }
                canvas.rect(zoneCanvasPoint, size, color.toHex())
            }
        }
    }
}


function buildGrid(context) {
    const regionSurfaceMap = buildRegionSurfaceMap(context)
    const zoneGrid = buildZoneGrid({
        ...context,
        regionSurfaceMap
    })
    return zoneGrid
}


function  buildRegionSurfaceMap(context) {
    const {world, worldPoint, zone, zoneRect} = context
    const regionSurfaceMap = new Map()
    const isLand = world.surface.isLand(worldPoint)
    const isLake = world.surface.isLake(worldPoint)
    // read first edges, then corners
    // const gridPoints = [...getEdgePoints(zoneRect), ...getCornerPoints(zoneRect)]
    // for (let [zonePoint, direction] of gridPoints) {
    //     const regionId = zone.topology.getRegion(zonePoint)

    //     const worldSidePoint = Point.atDirection(worldPoint, direction)
    //     const sideSurface = world.surface.get(worldSidePoint)
    //     // rule for lake zone
    //     if (isLake && world.surface.isLand(worldSidePoint)) {
    //         regionSurfaceMap.set(regionId, sideSurface)
    //     }
    //     // rule for general land zone
    //     const isSideOcean = world.surface.isOcean(worldSidePoint)
    //     const isSideSea = world.surface.isSea(worldSidePoint)
    //     if (isLand && (isSideOcean || isSideSea)) {
    //         regionSurfaceMap.set(regionId, sideSurface)
    //     }
    // }
    return regionSurfaceMap
}


function buildZoneGrid(context) {
    // final grid generator
    const {worldPoint, world, rect, zoneRect, regionGrid} = context
    const midpoint = world.topology.getMidpoint(worldPoint)
    const relativePoint = Point.multiplyScalar(worldPoint, zoneRect.width)
    const noiseRect = Rect.multiply(rect, zoneRect.width)
    return Grid.fromRect(zoneRect, zonePoint => {
        const noisePoint = Point.plus(relativePoint, zonePoint)
        const noise = world.noise.get4D(noiseRect, noisePoint, "zoneOutline")
        const worldSurface = world.surface.get(worldPoint)
        if (noise > 0.62) {
            return ContinentSurface.id
        }
        // handle zonePoints on water that are world surface borders
        if (world.surface.isBorder(worldPoint)) {
            if (noise > 0.55) {
                return SeaSurface.id
            }
            return OceanSurface.id
        }

        return worldSurface.id
    })
}


function getCornerPoints(rect) {
    const xMax = rect.width - 1
    const yMax = rect.height - 1
    return [
        [[0, 0], Direction.NORTHWEST],
        [[xMax, 0], Direction.NORTHEAST],
        [[0, yMax], Direction.SOUTHWEST],
        [[xMax, yMax], Direction.SOUTHEAST],
    ]
}


function getEdgePoints(rect) {
    const xMax = rect.width - 1
    const yMax = rect.height - 1
    const points = []
    // horizontal sweep
    for (let x = 0; x <= xMax; x++) {
        points.push([[x, 0], Direction.NORTH])
        points.push([[x, yMax], Direction.SOUTH])
    }
    // vertical sweep (avoid visited corners)
    for (let y = 0; y <= yMax; y++) {
        points.push([[0, y], Direction.WEST])
        points.push([[xMax, y], Direction.EAST])
    }
    return points
}
