import _ from 'lodash'
import React, { useState, useRef } from 'react';
import { render } from 'react-dom';

import { SeedInput, GenerateButton } from './ui/components'
import WorldView from './ui/WorldView'
import Menu from './ui/Menu'

import { WorldBuilder } from './world/builder'
import { Random } from './lib/base'

import "./App.css"


// const getCanvasMousePoint = (e, viewCanvas) => {
//     let scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
//         mouseX = e.clientX - viewCanvas.offsetLeft,
//         mouseY = e.clientY - viewCanvas.offsetTop + scrollOffset,
//         x = _.parseInt(mouseX / getTileSizeInput()),
//         y = _.parseInt(mouseY / getTileSizeInput());
//     return new Point(x, y);
// }

const buildSeed = (baseSeed='') => {
    let seed = baseSeed.length ? baseSeed : (+new Date())
    Random.seed = seed
    return seed
}


function Nami(props) {
    let worldBuilder = new WorldBuilder()

    let [world, setWorld] = useState(worldBuilder.build(buildSeed(), 257, 8))
    let [seed, setSeed] = useState('')

    const onGenerate = () => {
        let newSeed = buildSeed(seed)
        setWorld(worldBuilder.build(newSeed, 257, 8))
    }

    const onSeedChange = value => {
        let newSeed = buildSeed(value)
        setWorld(worldBuilder.build(newSeed, 257, 8))
        setSeed(newSeed)
    }

    return <>
        <header>
            <section id="header-title">Nami</section>
            <section id="header-menu">
                <SeedInput onChange={onSeedChange} />
                <GenerateButton onClick={onGenerate} />
            </section>
        </header>

        <Menu></Menu>

        <main>
            <section id="main-options">
                <p>Seed: {world.seed}</p>
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