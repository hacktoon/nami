import { Rect } from '/lib/number'
import { Random } from '/lib/random'
import { Matrix } from '/lib/matrix'
import { PointSet } from './set'
import { Point } from '.'


export class EvenPointSampling {
    static create(width, height, radius) {
        const samples = []
        const rect = new Rect(width, height)
        const pointSet = new PointSet(width, height)

        while(pointSet.size > 0) {
            const center = pointSet.random()
            EvenPointSampling.fillPointCircle(center, radius, point => {
                pointSet.delete(rect.wrap(point))
            })
            samples.push(center)
        }
        if (samples.length === 1) {
            const point = samples[0]
            const x = point[0] + Math.round(width / 2)
            const y = point[1] + Math.round(height / 2)
            samples.push(rect.wrap([x, y]))
        }
        return samples
    }

    // Bounding circle algorithm
    // https://www.redblobgames.com/grids/circle-drawing/
    static fillPointCircle(center, radius, callback) {
        const top    = center[1] - radius
        const bottom = center[1] + radius
        for (let y = top; y <= bottom; y++) {
            const dy    = y - center[1]
            const dx    = Math.sqrt(radius * radius - dy * dy)
            const left  = Math.ceil(center[0] - dx)
            const right = Math.floor(center[0] + dx)
            for (let x = left; x <= right; x++) {
                callback([x, y])
            }
        }
    }
}


export class EvenRealmOriginSampling {
    static create(width, height, points, radius) {
        const regionOriginSet = new PointSet(width, height, points)
        const samples = []

        while(regionOriginSet.size > 0) {
            const center = regionOriginSet.random()
            EvenRealmOriginSampling.fillPointCircle(center, radius, point => {
                regionOriginSet.delete(point)
            })
            samples.push(center)
        }
        if (samples.length === 1) {
            const point = samples[0]
            const x = point[0] + Math.round(width / 2)
            const y = point[1] + Math.round(height / 2)
            samples.push([x, y])
        }
        return samples
    }

    static fillPointCircle(center, radius, callback) {
        const top    = center[1] - radius
        const bottom = center[1] + radius
        for (let y = top; y <= bottom; y++) {
            const dy    = y - center[1]
            const dx    = Math.sqrt(radius * radius - dy * dy)
            const left  = Math.ceil(center[0] - dx)
            const right = Math.floor(center[0] + dx)
            for (let x = left; x <= right; x++) {
                callback([x, y])
            }
        }
    }
}


export class PoissonDiscSampling {
    static create(width, height, radius) {
        const samples = []
        const spawnPoints = []
        const rect = new Rect(width, height)
        const numSamplesBeforeRejection = 30
        const cellSize = radius / Math.sqrt(2)
        const mWidth = Math.floor(width / cellSize)
        const mHeight = Math.floor(height / cellSize)
        const grid = new Matrix(mWidth, mHeight)
        const firstSeed = [Math.floor(width / 2), Math.floor(height / 2)]

        spawnPoints.push(firstSeed)

        while(spawnPoints.length > 0) {
            const spawnIndex = Random.int(0, spawnPoints.length - 1)
            const spawnCentre = spawnPoints[spawnIndex]
			let candidateAccepted = false

            for (let i = 0; i < numSamplesBeforeRejection; i++) {
                let angle = Random.int(Math.PI * 2)
                let dir = [Math.cos(angle), Math.sin(angle)]
                let offset = Random.int(radius, 2*radius)
                let next = [
                    Math.floor(spawnCentre[0] + dir[0] * offset),
                    Math.floor(spawnCentre[1] + dir[1] * offset)
                ]

                if (PoissonDiscSampling.IsValid(next, rect, cellSize, radius, samples, grid)) {
                    const x = Math.floor(next[0] / cellSize)
                    const y = Math.floor(next[1] / cellSize)
					samples.push(next)
					spawnPoints.push(next)
					grid.set([x, y], samples.length)
					candidateAccepted = true
					break
				}
            }
            if (! candidateAccepted) {
				spawnPoints.splice(spawnIndex, 1)
			}
        }
        return samples
    }

    static IsValid(next, rect, cellSize, radius, points, grid) {
		if (next[0] >=0 && next[0] < rect.width
            && next[1] >= 0 && next[1] < rect.height
        ) {
		    let cellX = Math.floor(next[0] / cellSize);
		    let cellY = Math.floor(next[1] / cellSize);
		    let searchStartX = Math.max(0, cellX - 2);
		    let searchEndX = Math.min(cellX + 2, grid.width - 1);
		    let searchStartY = Math.max(0, cellY - 2);
		    let searchEndY = Math.min(cellY + 2, grid.height - 1);

            const dblRadius = radius * radius
			for (let x = searchStartX; x <= searchEndX; x++) {
				for (let y = searchStartY; y <= searchEndY; y++) {
					const pointIndex = grid.get([x, y]) - 1
					if (pointIndex != -1) {
						const dist = Point.distance(points[pointIndex], next)
						if (dist < dblRadius) {
							return false;
						}
					}
				}
			}
			return true;
		}
		return false;
	}
}
