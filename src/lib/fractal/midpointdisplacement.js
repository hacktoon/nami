import { Random } from '/src/lib/random'
import { Point } from '/src/lib/geometry/point'


export function midpointDisplacement(source, target, variance, callback) {
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
            Math.floor(mx + px * offset),
            Math.floor(my + py * offset)
        ]
    }

    recurse(source, target, variance)
}
