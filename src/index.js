import { useState } from 'react'
import * as ReactDOM from 'react-dom/client';

import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Form } from '/src/ui/form'
import { Title } from '/src/ui'

import { NoiseTileMap } from '/src/model/tilemap/noise'
import { RegionTileMap } from '/src/model/tilemap/region'
import { GeologyTileMap } from '/src/model/tilemap/world/geology'
import { TemperatureTileMap } from '/src/model/tilemap/world/temperature'

import "/src/ui/css/base.css"
import "/src/ui/css/tilemap.css"


const APPS = [
    GeologyTileMap,
    TemperatureTileMap,
    NoiseTileMap,
    RegionTileMap,
]
const appMap = new Map(APPS.map(TileMap => {
    const UITileMap = TileMap.ui
    return [TileMap.id, () => <UITileMap TileMap={TileMap} />]
}))


class App {
    static schema = new Schema(
        'App',
        Type.selection('app', 'App', {default: APPS[0].id, options: APPS})
    )
}


function RootComponent() {
    const [data, setData] = useState(App.schema.build())
    const Application = appMap.get(data.get('app'))

    return <section className="App">
        <section className="AppHeader">
            <Title className="AppTitle">NAMI</Title>
            <Form className="AppHeaderMenu"
                data={data}
                onSubmit={setData}>
            </Form>
        </section>
        <Application />
    </section>
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<RootComponent />)