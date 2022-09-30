import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { NoiseMapSet } from './noise'
import { LAYERS, BASE_RATIO, BASE_NOISE, Terrain } from './schema'


export class TerrainModel {
    #borderPoints
    #terrainMap

    #buildLayer(props) {
        const newPoints = []
        const layerType = Terrain.isLand(props.layer.terrain) ? 'land' : 'water'
        const noiseMap = props.noiseMapSet.get(props.layer.noise)
        props.pointQueue[layerType].forEach(point => {
            const noise = noiseMap.getNoise(point)
            if (this.#borderPoints.has(point) || noise < props.layer.ratio)
                return
            this.#terrainMap.set(point, props.layer.terrain)
            newPoints.push(point)
        })
        // detect borders on new points
        newPoints.forEach(point => {
            for (let sidePoint of Point.adjacents(point)) {
                if (this.#terrainMap.get(sidePoint) !== props.layer.terrain) {
                    // side is different, this point is a border
                    this.#setBorder(point, props.layer.terrain, props)
                    return
                }
            }
        })
        props.pointQueue[layerType] = newPoints
    }

    #buildBaseLayer(props) {
        const outlineNoiseMap = props.noiseMapSet.get(BASE_NOISE)
        const typeMap = {land: Terrain.BASIN, water: Terrain.SEA}
        const getType = noise => noise < BASE_RATIO ? 'water' : 'land'
        return Matrix.fromRect(outlineNoiseMap.rect, point => {
            const noise = outlineNoiseMap.getNoise(point)
            const type = getType(noise)
            const terrain = typeMap[type]
            props.pointQueue[type].push(point)
            // detect borders
            for (let sidePoint of Point.adjacents(point)) {
                const sideNoise = outlineNoiseMap.getNoise(sidePoint)
                const sideTerrain = typeMap[getType(sideNoise)]
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
            props.terrainErosionPoints.get(terrain).push(point)
    }

    constructor(rect, seed) {
        const noiseMapSet = new NoiseMapSet(rect, seed)
        const pointQueue = {water: [], land: []}
        const terrainErosionPoints = new Map(
            Terrain.landTypes().map(terrain => [terrain.id, []])
        )
        const props = {pointQueue,  noiseMapSet, terrainErosionPoints}
        this.#borderPoints = new PointSet()
        this.#terrainMap = this.#buildBaseLayer(props)
        for (let layer of LAYERS) {
            this.#buildLayer({...props, layer})
        }
    }

    get(point) {
        const id = this.#terrainMap.get(point)
        return Terrain.fromId(id)
    }

    isBorder(point) {
        return this.#borderPoints.has(point)
    }
}
