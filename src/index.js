import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { SelectField } from '/lib/ui/form/field'
import { Title } from '/lib/ui'

import { MapUI } from '/ui/map'
import { TestUI } from '/ui/test'

import TectonicsMap from '/model/world/tectonicsmap'
import WorldMap from '/model/world/worldmap'
import RegionMap from '/model/regionmap'
import NoiseMap from '/model/noisemap'

import "./css/base.css"
import "./css/map.css"


const APPS = {
    Test: { id: 'Test', component: () => <TestUI /> },
    WorldMap: { id: 'WorldMap', component: () => <MapUI Map={WorldMap} /> },
    NoiseMap: { id: 'NoiseMap', component: () => <MapUI Map={NoiseMap} /> },
    TectonicsMap: {
        id: 'TectonicsMap',
        component: () => <MapUI Map={TectonicsMap} />
    },
    RegionMap: {
        id: 'RegionMap',
        component: () => <MapUI Map={RegionMap} />
    },
}
const DEFAULT_APP = APPS.WorldMap


function AppHeader({app, setApp}) {
    return <section className="AppHeader">
        <Title className="AppTitle">NAMI</Title>
        <AppHeaderMenu app={app} setApp={setApp} />
    </section>
}


function AppHeaderMenu({app, setApp}) {
    const appOptions = Object.fromEntries(
        Object.entries(APPS).map(entry => {
            const [id, app] = entry
            return [id, app.id]
        })
    )
    const onChange = (_, value) => setApp(APPS[value])

    return <section className="AppHeaderMenu">
        <SelectField
            label="App"
            value={app.id}
            options={appOptions}
            onChange={onChange}
        />
    </section>
}


function RootComponent() {
    const [app, setApp] = useState(DEFAULT_APP)

    return <section className="App">
        <AppHeader app={app} setApp={setApp} />
        <app.component />
    </section>
}


ReactDOM.render(<RootComponent />, document.getElementById('app'));