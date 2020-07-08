import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import WorldMapApp  from '/ui/worldmap'
import MapApp from '/ui/regionmap'

import RegionMap from '/model/regionmap'

import { Title } from '/lib/ui'
import { SelectField } from '/lib/ui/form/field'

import "./style/base.css"
import "./style/index.css"


const APPS = {
    // worldMap: { id: 'worldMap', name: 'World Map', component: <WorldMapApp /> },
    regionMap: { id: 0, model: RegionMap, component: MapApp },
}
const DEFAULT_APP = APPS.regionMap


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
            return [id, app.model.meta.name]
        })
    )
    const onChange = value => setApp(APPS[value])

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
        {app.component({Map: app.model})}
    </section>
}


ReactDOM.render(<RootComponent />, document.getElementById('main'));