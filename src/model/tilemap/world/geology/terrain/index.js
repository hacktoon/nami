import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { PairMap } from '/src/lib/map'
import { ScanlineFill8 } from '/src/lib/floodfill/scanline'

import { NoiseMapSet } from './noise'
import { LandmassMap } from './surface'
import { LAYERS, BASE_RATIO, BASE_NOISE, Terrain } from './schema'

const MINIMUN_OCEAN_RATIO = 1  // 1%


export class TerrainModel {
    #erosionPoints
    #borderPoints
    #terrainMap
    #landmassMap

    #buildLayer(props) {
        const newPoints = []
        const layerType = Terrain.isLand(props.layer.terrain) ? 'land' : 'water'
        const noiseMap = props.noiseMapSet.get(props.layer.noise)
        props.points[layerType].forEach(point => {
            const noise = noiseMap.getNoise(point)
            if (this.#borderPoints.has(point) || noise < props.layer.ratio)
                return
            this.#terrainMap.set(point, props.layer.terrain)
            newPoints.push(point)
        })
        // detect borders on new points
        newPoints.forEach(point => {
            for (let sidePoint of Point.adjacents(point)) {
                const sideTerrain = this.#terrainMap.get(sidePoint)
                if (sideTerrain !== props.layer.terrain) {
                    this.#setBorder(point, props.layer.terrain, props)
                    return
                }
            }
        })
        props.points[layerType] = newPoints
    }

    #buildBaseLayer(props) {
        const outlineNoiseMap = props.noiseMapSet.get(BASE_NOISE)
        const typeMap = {land: Terrain.BASIN, water: Terrain.SEA}
        const getLayerType = point => {
            const noise = outlineNoiseMap.getNoise(point)
            return noise < BASE_RATIO ? 'water' : 'land'
        }
        return Matrix.fromRect(outlineNoiseMap.rect, point => {
            const layerType = getLayerType(point)
            const terrain = typeMap[layerType]
            props.points[layerType].push(point)
            // detect borders
            for (let sidePoint of Point.adjacents(point)) {
                const sideTerrain = typeMap[getLayerType(sidePoint)]
                if (terrain !== sideTerrain) {
                    // side is different, this point is a border
                    this.#setBorder(point, terrain, props)
                    break
                }
            }
            return terrain
        })
    }

    #setBorder(point, terrain, props) {
        this.#borderPoints.add(point)
        if (Terrain.isLand(terrain))
            props.erosionPoints.get(terrain).push(point)
    }

    #buildLandmassLayer(waterPoints) {
        let landmassId = 1
        const props = {
            waterPointMap: new PairMap(),
            bodies: new Map(),
            oceans: new Set(),
        }
        const landmass = new LandmassMap(props)
        for (let point of waterPoints) {
            const status = this.#detectLandmass(props, landmassId, point)
            landmassId += status ? 1 : 0
        }
        return landmass
    }

    #detectLandmass(props, landmassId, startPoint) {
        let area = 0
        const canFill = point => {
            const isWater = Terrain.isWater(this.#terrainMap.get(point))
            return isWater && ! props.waterPointMap.has(...point)
        }
        const onFill = point => {
            props.waterPointMap.set(...point, landmassId)
            area++
        }
        const filterPoint = point => this.#terrainMap.rect.wrap(point)
        if (canFill(startPoint)) {
            new ScanlineFill8(startPoint, {canFill, filterPoint, onFill}).fill()
            props.bodies.set(landmassId, area)
            const ratio = Math.round((area * 100) / this.#terrainMap.area)
            if (ratio >= MINIMUN_OCEAN_RATIO) {
                props.oceans.add(landmassId)
            }
            return true
        }
        return false
    }

    constructor(rect, seed) {
        const points = {water: [], land: []}
        const noiseMapSet = new NoiseMapSet(rect, seed)
        const erosionPoints = new Map(
            Terrain.landTypes().map(terrain => [terrain.id, []])
        )
        const props = {points, noiseMapSet, erosionPoints}
        this.#borderPoints = new PointSet()
        this.#terrainMap = this.#buildBaseLayer(props)
        this.#landmassMap = this.#buildLandmassLayer(points.water)
        for (let layer of LAYERS) {
            this.#buildLayer({...props, layer})
        }
        this.#erosionPoints = erosionPoints
    }

    get(point) {
        const id = this.#terrainMap.get(point)
        return Terrain.fromId(id)
    }

    isBorder(point) {
        const wrappedPoint = this.#terrainMap.rect.wrap(point)
        return this.#borderPoints.has(wrappedPoint)
    }

    isOcean(point) {
        const wrappedPoint = this.#terrainMap.rect.wrap(point)
        return this.#landmassMap.isOcean(wrappedPoint)
    }

    getErosionPoints() {
        return this.#erosionPoints
    }
}
