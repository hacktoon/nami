import { Point } from '/src/lib/point'
import { EvenPointSampling } from '/src/lib/point/sampling'
import { Direction } from '/src/lib/direction'
import { Grid } from '/src/lib/grid'
import {
    Surface,
    ContinentSurface,
    OceanSurface,
    SeaSurface,
    LakeSurface,
    IslandSurface,
} from './data'
import { RegionFloodFill } from './fill'



const SCALE = 2
const EMPTY = null


export class ZoneSurface {
    #grid

    constructor(worldPoint, params) {
        // rect scaled to world size, for noise locality
        this.point = worldPoint
        this.size = params.zoneSize
        this.#grid = this.#buildGrid({...params, worldPoint})
    }

    #buildGrid(context) {
        const [regionGrid, regionSidesMap] = this.#buildRegionGrid(context)
        const zoneGrid = this.#buildZoneGrid({...context, regionGrid, regionSidesMap})
        return zoneGrid
    }

    #buildRegionGrid(context) {
        // create a grid with many regions fragmenting the zone map
        const regionGrid = Grid.fromRect(context.zoneRect, () => EMPTY)
        const origins = EvenPointSampling.create(context.zoneRect, SCALE)
        const fillMap = new Map(origins.map((origin, id) => [id, origin]))
        const regionSidesMap = new Map()
        const ctx = {...context, regionGrid, regionSidesMap}
        new RegionFloodFill(fillMap, ctx).complete()
        return [regionGrid, regionSidesMap]
    }

    #buildZoneGrid(context) {
        const {worldPoint, layers, regionGrid, regionSidesMap, zoneRect} = context
        const zoneGrid = Grid.fromRect(zoneRect, zonePoint => {
            // default type
            let type = layers.surface.get(worldPoint)
            const regionId = regionGrid.get(zonePoint)
            const sideDirectionSet = regionSidesMap.get(regionId)
            // if (Point.equals(worldPoint, [40, 16])) {
            //     console.log(zonePoint, regionId, sideDirectionSet)
            // }
            return type.id
        })
        return zoneGrid
    }

    #buildRegionTypeMap(context) {
        const {layers, worldPoint, zoneRect, regionGrid} = context
        const regionTypeMap = new Map()
        // set type from world point
        Point.around(worldPoint, (worldSidePoint, direction) => {
            const isSideWater = layers.surface.isWater(worldSidePoint)
            if (layers.surface.isLand(worldPoint) && isSideWater) {
                // type = layers.surface.get(worldPoint)
            }
        })
        // iterateOuterPoints(zoneRect, (zonePoint, direction) => {
        //     const regionId = regionGrid.get(zonePoint)
        //     const worldSidePoint = Point.atDirection(worldPoint, direction)
        //     const type = this.#buildGridType(context, zonePoint, worldSidePoint)
        //     regionTypeMap.set(regionId, type)
        //     if (Point.equals(worldPoint, [40, 16])) {
        //         console.log(zonePoint, worldSidePoint, direction.name, type.name, regionId)
        //     }
        // })
        return regionTypeMap
    }

    #buildGridType(context, zonePoint, worldSidePoint) {
        const {layers, worldPoint} = context
        let type = layers.surface.get(worldPoint)
        if (layers.surface.isWater(worldSidePoint)) {
            type = layers.surface.get(worldSidePoint)
        }
        return type
    }

    get(point) {
        const surfaceId = this.#grid.get(point)
        return Surface.parse(surfaceId)
    }
}


function iterateOuterPoints(rect, callback) {
    const wMax = rect.width - 1
    const hMax = rect.height - 1
    // horizontal sweep
    for (let x = 0; x < rect.width; x++) {
        // top points
        const topDir = x == 0 ? Direction.NORTHWEST : (x == wMax ? Direction.NORTHEAST : Direction.NORTH)
        callback([x, 0], topDir)
        // bottom points
        const bottomDir = x == 0 ? Direction.SOUTHWEST : (x == wMax ? Direction.SOUTHEAST : Direction.SOUTH)
        callback([x, hMax], bottomDir)
    }
    // vertical sweep (avoid visited corners)
    for (let y = 1; y < hMax; y++) {
        // left points
        callback([0, y], Direction.EAST)
        // right points
        callback([wMax, y], Direction.WEST)
    }
}