import { Point } from './'


export class PointHash {
    constructor(points=[]) {
        this.set = new Set(points.map(p=>p.hash))
    }

    get size() {
        return this.set.size
    }

    get points() {
        const hashes = Array.from(this.set.values())
        return hashes.map(hash => Point.fromHash(hash))
    }

    has(point) {
        return this.set.has(point.hash)
    }

    add(points) {
        points.forEach(point => this.set.add(point.hash))
    }
}