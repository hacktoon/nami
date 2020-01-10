import React, { useState } from 'react'

import World from '/model/world'
import Config from './config'
import WorldView from './view'
import { Grid } from '/ui/lib'


export default function WorldApp(props) {
    let [world, setWorld] = useState(new World())

    const onConfigChange = config => setWorld(new World(config))

    return <Grid className='WorldApp'>
        <Config onChange={onConfigChange} />
        <WorldView world={world} />
    </Grid>
}