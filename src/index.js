import "/src/ui/css/base.css"
import "/src/ui/css/tilemap.css"

import { useState } from 'react'
import * as ReactDOM from 'react-dom/client';

import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Form } from '/src/ui/form'
import { Title } from '/src/ui'

import { NoiseTileMap } from '/src/model/tilemap/noise'
import { RegionTileMap } from '/src/model/tilemap/region'
import { WorldTileMap } from '/src/model/tilemap/world'


const APPS = [
    {value: 'WorldMap', label: 'WorldMap', TileMapClass: WorldTileMap},
    {value: 'NoiseMap', label: 'NoiseMap', TileMapClass: NoiseTileMap},
    {value: 'RegionMap', label: 'RegionMap', TileMapClass: RegionTileMap},
]

const UI_APP_COMPONENT_MAP = new Map(APPS.map(({value, TileMapClass}) => {
    const UITileMap = TileMapClass.ui
    const renderComponent = () => <UITileMap TileMap={TileMapClass} />
    return [value, renderComponent]
}))


class App {
    static schema = new Schema('App',
        Type.selection('app', 'App', {default: APPS[0].value, options: APPS})
    )
}


function RootComponent() {
    const [appData, setData] = useState(App.schema.build())
    const UIApp = UI_APP_COMPONENT_MAP.get(appData.get('app'))

    return <section className="App">
        <section className="AppHeader">
            <Title className="AppTitle">NAMI</Title>
            <Form className="AppHeaderMenu" data={appData} onSubmit={setData}></Form>
        </section>
        <UIApp />
    </section>
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<RootComponent />)