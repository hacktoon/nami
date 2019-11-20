import _ from 'lodash'

import React, { useState } from 'react';
import { render } from 'react-dom';

import WorldView from './ui/WorldView'
import WorldConfig from './ui/WorldConfig'

import { buildWorld } from './world/builder'

import "./index.css"


// const getCanvasMousePoint = (e, viewCanvas) => {
//     let scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
//         mouseX = e.clientX - viewCanvas.offsetLeft,
//         mouseY = e.clientY - viewCanvas.offsetTop + scrollOffset,
//         x = _.parseInt(mouseX / getTileSizeInput()),
//         y = _.parseInt(mouseY / getTileSizeInput());
//     return new Point(x, y);
// }
window.buildWorld = buildWorld

function App(props) {
    let [world, setWorld] = useState(buildWorld())

    let onConfigChange = config => {
        console.log(`onConfigChange, old name: ${world.name}, old seed: ${world.seed}, new seed: ${config.seed}`)
        let w = buildWorld(config)
        setWorld(w)
    }

    console.log(`render App: ${world.name}, ${world.seed}`);
    return <>
        <header>
            <section id="header-title">Nami</section>
        </header>
        <WorldConfig onChange={onConfigChange} />
        <WorldView world={world} />
    </>
}

render(<App />, document.getElementById('container'));