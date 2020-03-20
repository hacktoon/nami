import React from 'react'

import RegionsMenu from './menu'
import RegionsView from './view'

import "./index.css"


export default function RegionsApp(props) {
    return <section className='RegionsApp'>
        <RegionsMenu />
        <RegionsView />
    </section>
}