import React, { useState } from 'react'

import World from '/model/world'
import WorldConfigPanel from './config'
import WorldView from './view'
import { Layout } from '/ui/lib'

import "./index.css"


export default function WorldApp(props) {
    let [world, setWorld] = useState(new World())

    const onConfigChange = config => setWorld(new World(config))

    return <Layout className='WorldApp'>
        <WorldConfigPanel onChange={onConfigChange} />
        <WorldView world={world} />
    </Layout>
}