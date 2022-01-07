import React, { useState } from 'react'

const CLICK_TIMEOUT = 200


export function MouseTrack(props) {
    const [dragStart, setDragStart] = useState([0, 0])
    const [dragging, setDragging]   = useState(false)
    const [clickTimeout, setClickTimeout]   = useState(false)

    const handleMouseDown = event => {
        disableNativeEvent(event)
        const mousePoint = createMousePoint(event)
        setDragStart(mousePoint)
        setDragging(true)
        setClickTimeout(true)
        setTimeout(() => setClickTimeout(false), CLICK_TIMEOUT)
        props.onDragStart(mousePoint)
    }

    const handleMouseUp = event => {
        disableNativeEvent(event)
        const mousePoint = createMousePoint(event)
        if (clickTimeout) {
            props.onClick(mousePoint)
        }
        setDragging(false)
    }

    const handleMouseOut = event => {
        disableNativeEvent(event)
        const mousePoint = createMousePoint(event)
        if (dragging && props.onDragEnd) {
            props.onDragEnd(dragStart, mousePoint)
        }
        setDragging(false)
        props.onMouseOut(mousePoint)
    }

    const handleMouseMove = event => {
        disableNativeEvent(event)
        const mousePoint = createMousePoint(event)
        if (dragging) {
            props.onDrag && props.onDrag(dragStart, mousePoint)
        }
        props.onMove && props.onMove(mousePoint)
    }

    const handleWheel = event => {
        props.onWheel && props.onWheel(event.deltaY > 0 ? -1 : 1)
    }

    function createMousePoint(event) {
        disableNativeEvent(event)
        const {offsetX, offsetY} = event.nativeEvent
        return [offsetX, offsetY]
    }

    function disableNativeEvent(event) {
        event.stopPropagation()
        event.preventDefault()
    }

    return <div className="MouseTrack"
        onWheel={handleWheel}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}>
    </div>
}