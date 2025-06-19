import { Random } from '/src/lib/random'


export function midpointDisplacement([x1, y1], [x2, y2], roughness) {
    const points = [[x1, y1], [x2, y2]];

    function displace(p1, p2, depth) {
        if (depth <= 0) return;

        const midX = Math.floor((p1[0] + p2[0]) / 2);
        const midYBase = Math.floor((p1[1] + p2[1]) / 2);
        const offset = Random.choice(1, 2)

        const midY = midYBase + offset;
        const mid = [midX, midY];

        points.push(mid);

        displace(p1, mid, depth - 1);
        displace(mid, p2, depth - 1);
    }

    displace([x1, y1], [x2, y2], depth);

    return points
}




export const midpointDisplacement2 = (source, target, roughness, callback=()=>{}) => {
    // MidpointDisplacement algorithm generates a series of points between two points
    // using a roughness factor to create a fractal-like displacement.
    const deltaX = Math.abs(source[0] - target[0])
    const deltaY = Math.abs(source[1] - target[1])
    const fixedAxis = deltaX > deltaY ? 'x' : 'y'
    const displacedAxis = deltaX > deltaY ? 'y' : 'x'
    const size = Math.abs(target[fixedAxis] - source[fixedAxis])
    let displacement = roughness * (size / 2)
    let points = []

    const buildPoint = (p1, p2) => {
        if (Math.abs(p2[fixedAxis] - p1[fixedAxis]) <= 1)
            return
        const displacedValue = (p1[displacedAxis] + p2[displacedAxis]) / 2
        const variance = Random.int(-displacement, displacement)
        const point = [0, 0]
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
