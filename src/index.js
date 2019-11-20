import _ from 'lodash'
import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';

import WorldView from './ui/WorldView'
import WorldConfig from './ui/WorldConfig'

import { WorldBuilder } from './world/builder'

import "./index.css"


// const getCanvasMousePoint = (e, viewCanvas) => {
//     let scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
//         mouseX = e.clientX - viewCanvas.offsetLeft,
//         mouseY = e.clientY - viewCanvas.offsetTop + scrollOffset,
//         x = _.parseInt(mouseX / getTileSizeInput()),
//         y = _.parseInt(mouseY / getTileSizeInput());
//     return new Point(x, y);
// }


function App(props) {
    let worldBuilder = new WorldBuilder()

    let [world, setWorld] = useState(worldBuilder.build())
    let onConfigChange = config => setWorld(worldBuilder.build(config))

    return <>
        <header>
            <section id="header-title">Nami</section>
        </header>
        <WorldConfig onUpdate={onConfigChange} />
        <WorldView world={world} />
    </>
}

render(<App />, document.getElementById('container'));