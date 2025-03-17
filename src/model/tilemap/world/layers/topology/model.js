import { Random } from '/src/lib/random'


const ZONE_MIDDLE = 5
const ZONE_OFFSET_RANGE = [1, 3]


function buildMidpoint(direction) {
    // direction axis ([-1, 0], [1, 1], etc)
    const rand = (coordAxis) => {
        const offset = Random.int(...ZONE_OFFSET_RANGE)
        const axisToggle = coordAxis === 0 ? Random.choice(-1, 1) : coordAxis
        return ZONE_MIDDLE + (offset * axisToggle)
    }
    return direction.axis.map(coord => rand(coord))
}