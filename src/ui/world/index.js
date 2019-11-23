import React, { useState } from 'react'

import World from '../../model/world'
import WorldView from './WorldView'
import WorldConfigPanel from './WorldConfigPanel'


export default function WorldGenerator(props) {
    let [world, setWorld] = useState(new World())

    const onConfigChange = config => setWorld(new World(config))

    return <>
        <WorldConfigPanel onChange={onConfigChange} />
        <WorldView world={world} />
    </>
}