import { PropTypes } from '@dhis2/prop-types'
import { theme } from '@dhis2/ui-constants'
import React, { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import classes from './DraggableApp.module.css'

const App = ({ defaultAction, icon, displayName }) => (
    <div>
        <a className={classes['app-link']} href={defaultAction}>
            <img className={classes['app-icon']} src={icon} />
            <div className={classes['app-name']}>{displayName}</div>
        </a>
    </div>
)

App.propTypes = {
    defaultAction: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
}

const DND_ITEM_TYPE = 'APP'

const DraggableApp = ({ app, onMove }) => {
    const ref = useRef()

    const [{ isDragging }, connectDrag] = useDrag({
        item: { name: app.name, type: DND_ITEM_TYPE },
        collect: monitor => ({ isDragging: monitor.isDragging() }),
    })
    const [, connectDrop] = useDrop({
        accept: DND_ITEM_TYPE,
        drop(item) {
            if (item.name != app.name) {
                onMove(item.name, app.name)
            }
        },
    })

    connectDrag(ref)
    connectDrop(ref)

    return (
        <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <App {...app} />
        </div>
    )
}

DraggableApp.propTypes = {
    app: PropTypes.any.isRequired,
    onMove: PropTypes.func.isRequired,
}

export default DraggableApp
