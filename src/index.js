import _ from 'lodash'
import React, { useState } from 'react';
import { render } from 'react-dom';

import { SeedInput, GenerateButton, WorldView } from './ui/components'
import Menu from './ui/Menu'

import WorldBuilder from './world/builder'
import { Point } from './lib/point'
import { Random } from './lib/base'

import "./App.css"

// let viewCanvas = document.getElementById("viewCanvas"),
//     generateButton = document.getElementById("generateButton"),
//     seedInput = document.getElementById("seedInput"),
//     viewInput = document.getElementById('viewInput'),
//     tilesizeInput = document.getElementById("tilesizeInput"),
//     sizeInput = document.getElementById("sizeInput"),
//     roughnessInput = document.getElementById("roughnessInput"),
//     infoText = document.getElementById("main-options"),
//     mainView = document.getElementById("main-view"),
//     worldPainter


// const getViewInput = function() {
//     const viewParam = getURLParams('view')
//     let value = viewInput.options[viewInput.selectedIndex].value
//     if (viewParam) {
//         viewInput.value = value = viewParam
//     }
//     return value
// }
// const getTileSizeInput = function() {
//     const tilesizeParam = getURLParams('tilesize')
//     let value = Number(tilesizeInput.value)
//     if (tilesizeParam) {
//         tilesizeInput.value = value = Number(tilesizeParam)
//     }
//     return value
// }
// const getSizeInput = () => Number(sizeInput.value)
// const getRoughnessInput = () => Number(roughnessInput.value)


// const getCanvasMousePoint = (e, viewCanvas) => {
//     let scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
//         mouseX = e.clientX - viewCanvas.offsetLeft,
//         mouseY = e.clientY - viewCanvas.offsetTop + scrollOffset,
//         x = _.parseInt(mouseX / getTileSizeInput()),
//         y = _.parseInt(mouseY / getTileSizeInput());
//     return new Point(x, y);
// }

// const showTileInfo = tile => {
//     const wrap = (title, value) => {
//         return `<p class='title'>${title}</p><p class='value'>${value}</p>`
//     }
//     let tpl = wrap('World', world.name)
//     tpl += wrap('Seed', Random.seed)
//     if (!tile) {
//         infoText.innerHTML = tpl
//         return
//     }
//     const point = tile.point
//     tpl += wrap('Coordinates', point.hash())
//     infoText.innerHTML = tpl
// }


// /************ EVENT HANDLING *************************/
// let dragControl = {
//     startPoint: undefined,
//     endPoint: undefined,
//     dragging: false,
// }

// viewCanvas.addEventListener('mousedown', e => {
//     let point = getCanvasMousePoint(e, viewCanvas)
//     dragControl.startPoint = point
//     dragControl.dragging = true
// })

// viewCanvas.addEventListener('mousemove', e => {
//     let point = getCanvasMousePoint(e, viewCanvas)
//     let tile = world.get(point)
//     showTileInfo(tile)
// })


// viewCanvas.addEventListener('mouseup', e => {
//     let point = getCanvasMousePoint(e, viewCanvas)
//     dragControl.endPoint = point
//     dragControl.dragging = false
// })


function Nami(props) {
    let [seed, setSeed] = useState(+new Date())
    let [world, setWorld] = useState(null)

    const generate = () => {
        let worldBuilder = new WorldBuilder(seed, 257, 8)
        setWorld(worldBuilder.build())
    }

    const updateSeed = event => setSeed(event.target.value)

    return <>
        <header>
            <section id="header-title">Nami</section>
            <section id="header-menu">
                <SeedInput onChange={updateSeed} />
                <GenerateButton onClick={generate} />
            </section>
        </header>

        <Menu></Menu>

        <main>
            <section id="main-options">
                <label htmlFor="viewInput">View
                    <select id="viewInput">
                        <option value="heightmap">Heightmap</option>
                        <option value="relief">Relief</option>
                        <option value="heat">Heat</option>
                        <option value="moisture">Moisture</option>
                        <option value="water">Water</option>
                        <option value="biome">Biome</option>
                        <option value="landmass">Landmass</option>
                    </select>
                </label>
            </section>
            <WorldView world={world} />
        </main>
    </>
}

render(<Nami />, document.getElementById('root'));