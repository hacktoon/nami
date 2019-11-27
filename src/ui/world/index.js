import React, { useState } from 'react'

import World from '../../model/world'
import WorldView from './view'
import ConfigPanel from './config'


export default function WorldGenerator(props) {
    let [world, setWorld] = useState(new World())

    const onConfigChange = config => setWorld(new World(config))

    return <>
        <ConfigPanel onChange={onConfigChange} />
        <WorldView world={world} />
    </>
}