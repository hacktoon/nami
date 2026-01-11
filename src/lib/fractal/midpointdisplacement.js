import { Random } from '/src/lib/random'
import { Point } from '/src/lib/geometry/point'
import { clamp } from '/src/lib/function'


export function midpointDisplacement(rect, source, target, variance, callback) {
    function recurse(p1, p2, variance) {
        if (Point.distance(p1, p2) < 2) {
            callback(p1)
            callback(p2)
            return
        }
        const midpoint = generateMidpoint(p1, p2, variance)
        recurse(p1, midpoint, variance / 2)
        recurse(midpoint, p2, variance / 2)
    }

    function generateMidpoint(p1, p2, variance) {
        const [x1, y1] = p1
        const [x2, y2] = p2
        // calc relative midpoint
        const [mx, my] = [(x1 + x2) / 2, (y1 + y2) / 2]
        // direction vector is a subtraction
        const dx = x2 - x1
        const dy = y2 - y1
        // get perpendicular vector: (-dy, dx) or (dy, -dx)
        const [nx, ny] = [-dy, dx]
        // magnitude of vector length
        const size = Math.hypot(nx, ny)
        // convert to 0..1 scale
        const [px, py] = [nx / size, ny / size]
        const offset = Random.floatRange(-variance, variance)
        return [
            clamp(Math.floor(mx + px * offset), 1, rect.width - 2),
            clamp(Math.floor(my + py * offset), 1, rect.height - 2)
        ]
    }

    recurse(source, target, variance)
}


export function generateRandomPath(rect, source, target, roughness, callback) {
    const deltaX = Math.abs(source[0] - target[0])
    const deltaY = Math.abs(source[1] - target[1])
    const fixedAxis = deltaX > deltaY ? 0 : 1
    const displacedAxis = fixedAxis === 0 ? 1 : 0
    // distance between source and target to fill with path
    const size = Math.abs(target[fixedAxis] - source[fixedAxis])
    let displacement = roughness * (size / 2)
    let points = []

    const buildPoint = (p1, p2) => {
        if (Math.abs(p2[fixedAxis] - p1[fixedAxis]) <= 1)
            return
        const displacedValue = (p1[displacedAxis] + p2[displacedAxis]) / 2
        const variance = Random.int(-displacement, displacement)
        const point = []

        point[fixedAxis] = Math.floor((p1[fixedAxis] + p2[fixedAxis]) / 2)
        point[displacedAxis] = Math.round(displacedValue + variance)
        return point
    }

    const midpoints = (p1, p2, size) => {
        let points = []
        let point = buildPoint(p1, p2)
        if (!point)
            return points
        displacement = roughness * size
        points = points.concat(midpoints(p1, point, size / 2))
        addPoint(point)
        points = points.concat(midpoints(point, p2, size / 2))
        return points
    }

    const addPoint = (point) => {
        points.push(point)
        callback(point)
    }

    addPoint(source)
    points = points.concat(midpoints(source, target, size / 2))
    addPoint(target)

    return points
}
