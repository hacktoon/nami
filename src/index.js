import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { Schema, Type } from '/lib/schema'
import { SelectField } from '/lib/ui/form/field'
import { Title } from '/lib/ui'

import { MapUI } from '/ui/map'
import { Test, TestUI } from '/ui/test'

import TectonicsMap from '/model/world/tectonicsmap'
import WorldMap from '/model/world/worldmap'
import RegionMap from '/model/regionmap'
import NoiseMap from '/model/noisemap'

import "./css/base.css"
import "./css/map.css"


const APPS = [
    // model,      component
    [Test,         TestUI],
    [WorldMap,     MapUI],
    [NoiseMap,     MapUI],
    [TectonicsMap, MapUI],
    [RegionMap,    MapUI],
]

const DEFAULT_ID = TectonicsMap.id

const appMap = new Map(APPS.map(([model, Component]) => {
    return [model.id, () => <Component model={model} />]
}))

const options = Object.fromEntries(APPS.map(([model,]) => [model.id, model.id]))


class App {
    static schema = new Schema(
        Type.enum('app', 'App', '')
    )
}


function RootComponent() {
    const [id, setId] = useState(DEFAULT_ID)
    const Application = appMap.get(id)

    return <section className="App">
        <section className="AppHeader">
            <Title className="AppTitle">NAMI</Title>
            <section className="AppHeaderMenu">
                <SelectField
                    label="App"
                    value={id}
                    options={options}
                    onChange={setId}
                />
            </section>
        </section>
        <Application />
    </section>
}


ReactDOM.render(<RootComponent />, document.getElementById('app'));