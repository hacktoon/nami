import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import WorldMapApp  from '/ui/worldmap'
import RegionMapApp from '/ui/regionmap'

import { Title } from '/lib/ui'
import { SelectField } from '/lib/ui/form/field'

import "./style/base.css"
import "./style/index.css"


const APPS = {
    worldMap: { id: 'worldMap', name: 'World Map', component: <WorldMapApp /> },
    regionMap: { id: 'regionMap', name: 'Region Map', component: <RegionMapApp /> },
}
const DEFAULT_APP = APPS.regionMap


function AppHeader({app, setApp}) {
    return <section className="AppHeader">
        <Title className="AppTitle">NAMI</Title>
        <MainMenu app={app} setApp={setApp} />
    </section>
}


function MainMenu({app, setApp}) {
    const onChange = event => setApp(APPS[event.target.value])
    const appOptions = Object.fromEntries(
        Object.entries(APPS).map(entry => {
            const [id, app] = entry
            return [id, app.name]
        })
    )

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
        {app.component}
    </section>
}


ReactDOM.render(<RootComponent />, document.getElementById('main'));