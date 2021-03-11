import { PropTypes } from '@dhis2/prop-types'
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

const DraggableApp = ({ app, onDrag, onDrop }) => {
    const [{ isDragging }, connectDrag] = useDrag({
        item: { name: app.name, type: DND_ITEM_TYPE },
        collect: monitor => ({ isDragging: monitor.isDragging() }),
        end: onDrop,
    })
    const [, connectDrop] = useDrop({
        accept: DND_ITEM_TYPE,
        hover(item) {
            if (item.name != app.name) {
                onDrag(item.name, app.name)
            }
        },
    })
    const ref = useRef()

    connectDrag(ref)
    connectDrop(ref)

    return (
        <div
            ref={ref}
            style={{ visibility: isDragging ? 'hidden' : 'visible' }}
        >
            <App {...app} />
        </div>
    )
}

DraggableApp.propTypes = {
    app: PropTypes.any.isRequired,
    onDrag: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
}

export default DraggableApp
