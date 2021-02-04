import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { Schema, Type } from '/lib/schema'
import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { Title } from '/lib/ui'

import { MapUI } from '/ui/map'
import { Test, TestUI } from '/ui/test'

import TectonicsMap from '/model/world/tectonicsmap'
import WorldMap from '/model/world/worldmap'
import RegionMap from '/model/regionmap'
import FloodFillMap from '/model/floodfillmap'
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
    [FloodFillMap,    MapUI],
]


const appMap = new Map(APPS.map(([model, Component]) => {
    return [model.id, () => <Component model={model} />]
}))

const options = APPS.map(([model,]) => [model.id, model.id])

class App {
    static schema = new Schema(
        Type.enum('app', 'App', FloodFillMap.id, {options})
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