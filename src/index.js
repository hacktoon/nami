import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import WorldMapApp from '/ui/worldmap'
import RegionMapApp from '/ui/regionmap'
import HeightMapApp from '/ui/heightmap'

import { Text } from '/lib/ui'
import { SelectField } from '/lib/ui/field'

import "./base.css"
import "./index.css"


const APPS = {
    worldMap: { id: 'worldMap', name: 'World Map', component: <WorldMapApp /> },
    regionMap: { id: 'regionMap', name: 'Region Map', component: <RegionMapApp /> },
    heightMap: { id: 'heightMap', name: 'Height Map', component: <HeightMapApp /> }
}
const DEFAULT_APP = APPS.regionMap


function Main() {
    const [app, setApp] = useState(DEFAULT_APP)

    return <section className="MainApp">
        <MainHeader app={app} setApp={setApp} />
        {app.component}
    </section>
}

function MainHeader({app, setApp}) {
    return <section className="MainHeader">
        <Text className="MainTitle">NAMI</Text>
        <MainMenu app={app} setApp={setApp} />
    </section>
}

function MainMenu({app, setApp}) {
    return <section className="MainMenu">
        <AppSelect apps={APPS} current={app} setApp={setApp} />
    </section>
}

function AppSelect({ apps, current, setApp }) {
    const onChange = event => {
        const id = event.target.value
        setApp(apps[id])
    }

    const appOptions = Object.fromEntries(
        Object.entries(apps).map(entry => {
            const [id, app] = entry
            return [id, app.name]
        }))

    return <SelectField
        label="App"
        value={current.id}
        options={appOptions}
        onChange={onChange}
    />
}


ReactDOM.render(<Main />, document.getElementById('main'));