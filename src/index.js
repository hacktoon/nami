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


class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = { world: new World() }
        this.onConfigChange = this.onConfigChange.bind(this)
    }

    onConfigChange(config) {
        let oldWorld = this.state.world
        let world = new World(config)
        this.setState({world})
    }

    render() {
        let world = this.state.world
        return <>
            <header>
                <section id="header-title">Nami</section>
            </header>
            <WorldConfig onChange={this.onConfigChange} />
            <WorldView world={world} />
        </>
    }
}

render(<App />, document.getElementById('container'));