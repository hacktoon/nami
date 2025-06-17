import { Point } from '/src/lib/geometry/point'
import { Direction } from '/src/lib/direction'
import { Grid } from '/src/lib/grid'
import { Rect } from '/src/lib/geometry/rect'
import { ContinentSurface, OceanSurface, Surface } from './type'


export class SurfaceZone {
    #grid

    constructor(context) {
        this.size = context.zoneSize
        this.zones = context.zones
        this.world = context.world
        this.#grid = buildGrid(context)
    }

    get(point) {
        const surfaceId = this.#grid.get(point)
        return Surface.parse(surfaceId)
    }

    draw(props) {
        const {canvas, tilePoint, canvasPoint, tileSize} = props
        const size = tileSize / this.size
        // render zone tiles
        const showRiver = this.params.get('showRivers') && tileSize >= 8
        const river = this.world.river.get(tilePoint)
        const biome = this.world.biome.get(tilePoint)
        for (let x=0; x < this.size; x++) {
            const xSize = x * size
            for (let y=0; y < this.size; y++) {
                const zonePoint = [y, x]
                const ySize = y * size
                const zoneCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const zoneSurface = zones.surface.get(zonePoint)
                const color = showRiver && zones.river.has(zonePoint) && ! zoneSurface.water
                              ? river.stretch.color
                              : zoneSurface.water ? zoneSurface.color : biome.color
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
    const {world, worldPoint, zones, zoneRect} = context
    const regionSurfaceMap = new Map()
    const isLand = world.surface.isLand(worldPoint)
    const isLake = world.surface.isLake(worldPoint)
    // read first edges, then corners
    // const gridPoints = [...getEdgePoints(zoneRect), ...getCornerPoints(zoneRect)]
    // for (let [zonePoint, direction] of gridPoints) {
    //     const regionId = zones.topology.getRegion(zonePoint)

    //     const worldSidePoint = Point.atDirection(worldPoint, direction)
    //     const sideSurface = world.surface.get(worldSidePoint)
    //     // rule for lake zones
    //     if (isLake && world.surface.isLand(worldSidePoint)) {
    //         regionSurfaceMap.set(regionId, sideSurface)
    //     }
    //     // rule for general land zones
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
        if (noise > 0.62) {
            return ContinentSurface.id
        }
        return OceanSurface.id
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
