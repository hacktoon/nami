import { Matrix } from '/lib/base/matrix'
import { ScanlineFill } from '/lib/floodfill/scanline'


const NO_DEFORMATION = null
const OROGENY = 1
const TRENCH = 2
const RIFT = 3

const EMPTY = null


export function buildGeoMatrix(plateIndex, groupTilemap, noiseMap) {
    const {width, height} = groupTilemap
    const matrix = new Matrix(width, height, () => EMPTY)

    groupTilemap.forEach(group => {
        const plate = plateIndex.get(group.id)
        const config = new PlateFillConfig({
            plate, group, matrix, groupTilemap, noiseMap
        })
        new ScanlineFill(group.origin, config).fill()
    })
    return matrix
}


class PlateFillConfig {
    constructor(config) {
        this.groupTilemap = config.groupTilemap
        this.noiseMap = config.noiseMap
        this.matrix = config.matrix
        this.plate = config.plate
        this.group = config.group
    }

    canFill(point) {
        const currentGroup = this.groupTilemap.getGroup(point)
        const isSameGroup = this.group.id === currentGroup.id
        return isSameGroup && this.matrix.get(point) === EMPTY
    }

    onFill(point) {
        const region = this.groupTilemap.getRegion(point)
        const noiseValue = this.noiseMap.get(point)
        const coastValue = this.noiseMap.getCoast(point)

        let value = 1 // land
        if (this.plate.isOceanic()) {
            value = 0
        } else if (this.plate.isShield()) {
            value = 1
        } else {
            const deform = this.plate.id % 2 === 0 ? 2 : 0
            value = coastValue > 80 ? deform : 1
        }

        this.matrix.set(point, value)
    }

    filterPoint(point) {
        return this.matrix.wrap(point)
    }
}
