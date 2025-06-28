import "/src/ui/css/base.css"
import "/src/ui/css/tilemap.css"
import "/src/ui/css/synth.css"

import { useState } from 'react'
import * as ReactDOM from 'react-dom/client';

import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Form } from '/src/ui/form'
import { Title } from '/src/ui'

import { NoiseTileMap } from '/src/model/tilemap/noisemap'
import { RegionTileMap } from '/src/model/tilemap/regionmap'
import { WorldTileMap } from '/src/model/tilemap/worldmap'
import { AudioSynth } from '/src/model/synth'


const APPS = [
    {value: 'AudioSynth', label: 'AudioSynth', AppModelClass: AudioSynth},
    {value: 'WorldMap', label: 'WorldMap', AppModelClass: WorldTileMap},
    {value: 'NoiseMap', label: 'NoiseMap', AppModelClass: NoiseTileMap},
    {value: 'RegionMap', label: 'RegionMap', AppModelClass: RegionTileMap},
]

const UI_APP_COMPONENT_MAP = new Map(APPS.map(({value, AppModelClass}) => {
    const UIModelComponent = AppModelClass.ui
    const renderComponent = () => <UIModelComponent modelClass={AppModelClass} />
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