import _ from 'lodash'

import React from 'react'
import { render } from 'react-dom'

import WorldGenerator from './ui/world'

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
    return <>
        <header>
            <section id="header-title">Nami</section>
        </header>
        <WorldGenerator />
    </>
}

render(<App />, document.getElementById('container'));