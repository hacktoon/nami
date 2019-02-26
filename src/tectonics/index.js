let viewCanvas = document.getElementById("world"),
    numPlatesInput = document.getElementById("numPlates"),
    generateButton = document.getElementById("generate"),
    resetButton = document.getElementById("reset"),
    growButton = document.getElementById("grow"),
    growthRateInput = document.getElementById("growthRate"),
    partialGrowCheckbox = document.getElementById("partialGrow"),
    growLotteryCheckbox = document.getElementById("growLottery"),
    drawLabelsCheckbox = document.getElementById("drawLabels")

var TILESIZE = 2,
    SIZE = 256,
    tectonics = undefined,
    painter = new TectonicsPainter(viewCanvas)

const createTectonics = () => {
    tectonics = new Tectonics(SIZE, getTotalPlates())
    tectonics.initPlates()
}

const getTotalPlates = () => {
    let value = Number(numPlatesInput.value)
    numPlatesInput.value = value
    return value
}

const getGrowthRate = () => {
    let value = Number(growthRateInput.value)
    growthRateInput.value = value
    return value
}

const draw = () => {
    viewCanvas.width = tectonics.grid.width * TILESIZE
    viewCanvas.height = tectonics.grid.height * TILESIZE
    painter.draw(tectonics, TILESIZE)
}

const init = () => {
    createTectonics()
    draw()
}

generateButton.addEventListener('click', () => {
    createTectonics()
    let isPartial = partialGrowCheckbox.checked
    let times = getGrowthRate()
    let chance = growLotteryCheckbox.checked
    tectonics.build(times, chance, isPartial)
    draw()
})

drawLabelsCheckbox.addEventListener('click', draw)
resetButton.addEventListener('click', init)

growButton.addEventListener('click', () => {
    let isPartial = partialGrowCheckbox.checked
    let times = getGrowthRate()
    let chance = growLotteryCheckbox.checked
    tectonics.plates.forEach(plate => {
        if (chance && _.sample([true, false]))
            return
        if (isPartial){
            plate.region.growPartial(times)
        } else {
            plate.region.grow(times)
        }
    })
    draw()
})

generateButton.click()
