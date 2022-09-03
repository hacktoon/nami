import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { TerrainTypeMap } from './terrain'


class Layer {
    constructor(params) {
        this.params = params
    }
}


class NoiseLayer extends Layer {
    build(noiseMaps, typeMap, terrainMap=null) {
        const noiseMap = noiseMaps.get(this.params.noise.id)
        const params = {noiseMap, typeMap, terrainMap, ...this.params}
        return Matrix.fromRect(noiseMap.rect, point => {
            for (let sidePoint of Point.adjacents(point)) {
                const id = this.buildMarginTile(point, sidePoint, params)
                if (id !== null)
                    return id
            }
            return this.buildTile(point, params)
        })
    }
}


export class OutlineNoiseLayer extends NoiseLayer {
    buildTile(point, params) {
        const noise = params.noiseMap.getNoise(point)
        const range = [TerrainTypeMap.types.PLAIN, TerrainTypeMap.types.SEA]
        return - (noise >= params.ratio ? range[0] : range[1])
    }

    buildMarginTile(point, sidePoint, params) {
        const noise = params.noiseMap.getNoise(point)
        const sideNoise = params.noiseMap.getNoise(sidePoint)
        if (noise >= params.ratio && sideNoise < params.ratio) {
            return TerrainTypeMap.types.BASIN
        }
        if (noise < params.ratio && sideNoise >= params.ratio) {
            return TerrainTypeMap.types.SEA
        }
        return null
    }
}


export class BaseTerrainNoiseLayer extends NoiseLayer {
    buildTile(point, params) {
        const noise = params.noiseMap.getNoise(point)
        const currentId = params.terrainMap.get(point)
        if (params.typeMap.isMargin(currentId))
            return currentId
        let condition = noise >= params.landRatio
        let range = [TerrainTypeMap.types.PLAIN, TerrainTypeMap.types.BASIN]
        if (params.typeMap.isWater(currentId)) {
            condition = noise >= params.waterRatio
            range = [TerrainTypeMap.types.SEA, TerrainTypeMap.types.OCEAN]
        }
        return -(condition ? range[0] : range[1])
    }

    buildMarginTile(point, sidePoint, params) {
        const noise = params.noiseMap.getNoise(point)
        const sideNoise = params.noiseMap.getNoise(sidePoint)
        const currentId = params.terrainMap.get(point)
        if (params.typeMap.isMargin(currentId))
            return currentId
        if (params.typeMap.isWater(currentId)) {
            if (noise <= params.waterRatio && sideNoise > params.waterRatio) {
                return TerrainTypeMap.types.OCEAN
            }
        } else {
            if (noise >= params.landRatio && sideNoise < params.landRatio) {
                return TerrainTypeMap.types.PLAIN
            }
        }
        return null
    }
}
