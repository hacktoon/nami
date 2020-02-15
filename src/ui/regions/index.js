import React, { useState } from 'react'

import { Layout } from '/ui/lib'
import Config from './config'
import "./index.css"


export default function RegionsApp(props) {
    const onConfigChange = config => console.log(config)

    return <Layout className='RegionsApp'>
        <Config onChange={onConfigChange} />
    </Layout>
}