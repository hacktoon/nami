import React, { useState } from 'react'

import Regions from '/model/regions'
import RegionsMenu from './menu'
import RegionsView from './view'
import { Component } from '/ui/lib'

import "./index.css"


export default function RegionsApp(props) {
    let [regions, setRegions] = useState(new Regions())

    const onConfigChange = config => setRegions(new Regions(config))

    return <Component className='RegionsApp'>
        <RegionsMenu onChange={onConfigChange} />
        <RegionsView regions={regions} />
    </Component>
}