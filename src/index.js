import _ from 'lodash'

import React, { useState } from 'react';
import { render } from 'react-dom';

import World from './world'
import WorldView from './ui/WorldView'
import WorldConfig from './ui/WorldConfig'

import "./index.css"


// const getCanvasMousePoint = (e, viewCanvas) => {
//     let scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
//         mouseX = e.clientX - viewCanvas.offsetLeft,
//         mouseY = e.clientY - viewCanvas.offsetTop + scrollOffset,
//         x = _.parseInt(mouseX / getTileSizeInput()),
//         y = _.parseInt(mouseY / getTileSizeInput());
//     return new Point(x, y);
// }


function App() {
    let [world, setWorld] = useState(new World())

    const onConfigChange = config => {
        setWorld(new World(config))
    }

    return <>
        <header>
            <section id="header-title">Nami</section>
        </header>
        <WorldConfig onChange={onConfigChange} />
        <WorldView world={world} />
    </>
}

render(<App />, document.getElementById('container'));