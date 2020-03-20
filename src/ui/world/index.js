import React, { useState } from 'react'

import World from '/model/world'
import WorldMenu from './menu'
import WorldView from './view'

import "./index.css"


export default function WorldApp(props) {
    let [world, setWorld] = useState(new World())

    const onConfigChange = config => setWorld(new World(config))

    return <section className='WorldApp'>
        <WorldMenu onChange={onConfigChange} />
        <WorldView world={world} />
    </section>
}