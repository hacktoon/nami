
class TectonicsBuilder {
    static build(world, numPlates) {
        let tectonics = new Tectonics(world.size, numPlates),
            growthRate = 15,
            chanceToGrow = true,
            partialGrow = true

        tectonics.initPlates()

        tectonics.onPlatePoint((point, plate, step) => {
            var tile = world.getTile(point)
            tile.plate = plate
            if (plate.isDenser()){
                var h =  world.getTile(point).height
                world.lowerTerrain(point, h/2)
            }
        })

        tectonics.onPlateEdgeDetect((point, plate, step) => {
            var tile = world.getTile(point)
            tile.isPlateEdge = true
            world.raiseTerrain(point, _.random(10, 50))
        })

        tectonics.build(growthRate, chanceToGrow, partialGrow)
    }
}


class Tectonics {
    constructor(size, numPlates) {
        this.numPlates = numPlates
        this.grid = new Grid(size, size)
        this.plates = []
        this.plateIdMap = {}
        this.onFillCallback = _.noop
        this.onPlateEdgeCallback = _.noop
    }

    onPlatePoint (callback) {
        this.onFillCallback = (point, fillValue, step) => {
            let plate = this.plateIdMap[fillValue]
            callback(point, plate, step)
        }
    }

    onPlateEdgeDetect (callback) {
        this.onPlateEdgeCallback = (edge, outerEdge, step) => {
            let plate = this.getPlateByPoint(edge)
            let otherPlate = this.getPlateByPoint(outerEdge)
            callback(edge, outerEdge, step)
        }
    }

    getPlateById (id) {
        return this.plateIdMap[id]
    }

    getPlateByPoint (point) {
        let id = this.grid.get(point)
        return this.getPlateById(id)
    }

    /* Grow the plates until all them complete. */
    build (times, chance, isPartial) {
        let totalCompleted = 0,
            completedMap = {}
        chance = _.defaultTo(chance, false)

        while (totalCompleted < this.plates.length) {
            this.plates.forEach(plate => {
                if (plate.region.isComplete()) {
                    totalCompleted += completedMap[plate.id] ? 0 : 1
                    completedMap[plate.id] = 1
                    return
                }
                if (chance && _.sample([true, false]))
                    return
                if (isPartial) {
                    plate.region.growPartial(times)
                } else {
                    plate.region.grow(times)
                }
            })
        }
    }

    initPlates () {
        const eachPoint = (startPoint, plateId) => {
            var plate = new Plate(plateId),
                originalValue = this.grid.get(startPoint)

            const onFill = (neighbor, point, step) => {
                this.grid.set(neighbor, plateId)
                this.onFillCallback(neighbor, plateId, step)
            }

            const isFillable = (neighbor, point, step) => {
                var neighborValue = this.grid.get(neighbor)
                if (neighborValue != plateId && neighborValue != originalValue){
                    plate.edges.push(point)
                    this.onPlateEdgeCallback(point, neighbor, step)
                    return false
                }
                return neighborValue === originalValue
            }

            plate.region = new GridFill(startPoint, onFill, isFillable)
            this.plateIdMap[plateId] = plate
            this.plates.push(plate)
        }
        new GridPointDistribution(this.grid, this.numPlates).each(eachPoint)
    }
}


class Plate {
    constructor(id) {
        this.id = id
        this.name = NameGenerator.createLandMassName()
        this.region = undefined
        this.speed = _.sample([1, 2, 3])
        this.density = _.sample([1, 1, 2, 2, 3])
        this.direction = Direction.randomCardinal()
        this.edges = []
    }

    isDenser () {
        return this.density === 3
    }

    forEachEdge (callback) {
        this.edges.forEach(callback)
    }

    forEachSeed (callback) {
        this.region.seeds.each(callback)
    }
}


class PlateDeformation {
    constructor(plate) {
        this.directionPenalty = 300
        this.plate = plate
    }

    between (plate) {
        var direction = this.plate.direction
        if (Direction.isDivergent(direction, plate.direction)) {
            return -directionPenalty
        } else if (Direction.isConvergent(direction, plate.direction)) {
            return directionPenalty
        }
        return 0
    }
}
