import _ from 'lodash'
import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';

import { SeedInput, GenerateButton } from './ui/components'
import WorldView from './ui/WorldView'
import WorldConfig from './ui/WorldConfig'

import { WorldBuilder } from './world/builder'
import { Random } from './lib/base'

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

    let [seed, setSeed] = useState(+new Date())
    let [config, setConfig] = useState({size: 257, roughness: 8})
    let [world, setWorld] = useState(worldBuilder.build(seed, config))

    console.log(seed, world);

    const onGenerate = () => {
        let newSeed = seed.lenght ? seed : (+new Date())
        setWorld(worldBuilder.build(newSeed, config))
        setSeed(newSeed)
    }

    const onSeedChange = newSeed => {
        setWorld(worldBuilder.build(newSeed, config))
        setSeed(newSeed)
    }

    const onConfigChange = newConfig => {
        setWorld(worldBuilder.build(seed, newConfig))
        setConfig(newConfig)
        console.log(seed, world);
    }

    return <>
        <header>
            <section id="header-title">Nami</section>
            <section id="header-menu">
                <SeedInput onChange={onSeedChange} />
                <GenerateButton onClick={onGenerate} />
            </section>
        </header>

        <WorldConfig onChange={onConfigChange} />

        <WorldView world={world} />
    </>
}

render(<App />, document.getElementById('container'));