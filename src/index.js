import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { Schema, Type } from '/lib/base/schema'
import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { Title } from '/lib/ui'

import { TestApp } from '/lib/ui/test'
import TectonicsMap from '/model/world/tectonicsmap'
import WorldMap from '/model/world/worldmap'
import RegionMap from '/model/regionmap'
import FloodFillMap from '/model/floodfillmap'
import NoiseMap from '/model/noisemap'

import "./css/base.css"
import "./css/map.css"


const APPS = [
    TestApp,
    WorldMap,
    NoiseMap,
    TectonicsMap,
    RegionMap,
    FloodFillMap,
]


const appMap = new Map(APPS.map(model => {
    return [model.name, () => <model.ui model={model} />]
}))


class App {
    static schema = new Schema(
        Type.enum('app', 'App', {default: TectonicsMap.name, options: APPS})
    )
}


function RootComponent() {
    const [data, setData] = useState(App.schema.defaultValues())
    const Application = appMap.get(data.get('app'))

    return <section className="App">
        <section className="AppHeader">
            <Title className="AppTitle">NAMI</Title>
            <Form className="AppHeaderMenu"
                schema={App.schema}
                data={data}
                onSubmit={setData}
            >
                <Button label="Run" />
            </Form>
        </section>
        <Application />
    </section>
}


ReactDOM.render(<RootComponent />, document.getElementById('app'));