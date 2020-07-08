import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { MapApp } from '/ui/map'

import WorldMap from '/model/worldmap'
import RegionMap from '/model/regionmap'

import { Title } from '/lib/ui'
import { SelectField } from '/lib/ui/form/field'

import "./style/base.css"
import "./style/index.css"


const APPS = {
    WorldMap: { id: 'WorldMap', component: () => <MapApp Map={WorldMap} /> },
    RegionMap: { id: 'RegionMap', component:  () => <MapApp Map={RegionMap} /> },
}
const DEFAULT_APP = APPS.RegionMap


function AppHeader({app, setApp}) {
    return <section className="AppHeader">
        <Title className="AppTitle">NAMI</Title>
        <MainMenu app={app} setApp={setApp} />
    </section>
}


function MainMenu({app, setApp}) {
    const appOptions = Object.fromEntries(
        Object.entries(APPS).map(entry => {
            const [id, app] = entry
            return [id, app.id]
        })
    )
    const onChange = (_, value) => setApp(APPS[value])

    return <section className="MainMenu">
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


ReactDOM.render(<RootComponent />, document.getElementById('main'));