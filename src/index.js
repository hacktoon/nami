import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { Title } from '/lib/ui'

import { TestApp } from '/lib/ui/test'
import TectonicsMap from '/model/map/world/tectonics'
import WorldMap from '/model/map/world/world'
import RegionMap from '/model/map/region'
import NoiseMap from '/model/map/noise'

import "./css/base.css"
import "./css/map.css"


const APPS = [
    TestApp,
    WorldMap,
    NoiseMap,
    TectonicsMap,
    RegionMap,
]


const appMap = new Map(APPS.map(model => {
    return [model.label, () => <model.ui model={model} />]
}))


class App {
    static schema = new Schema(
        Type.selection('app', 'App', {default: RegionMap.label, options: APPS})
    )
}


function RootComponent() {
    const [data, setData] = useState(App.schema.parse())
    const Application = appMap.get(data.get('app'))

    return <section className="App">
        <section className="AppHeader">
            <Title className="AppTitle">NAMI</Title>
            <Form className="AppHeaderMenu"
                data={data}
                onSubmit={setData}>
                <Button label="Run" />
            </Form>
        </section>
        <Application />
    </section>
}


ReactDOM.render(<RootComponent />, document.getElementById('app'));