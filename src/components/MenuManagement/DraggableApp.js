import { theme } from '@dhis2/ui-constants'
import React, { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'

const App = ({ defaultAction, icon, displayName }) => (
    <div>
        <a href={defaultAction}>
            <img className={'app-icon'} src={icon} />
            <div className={'app-name'}>{displayName}</div>

            <style jsx>{`
                a {
                    display: inline-block;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 96px;
                    margin: 16px;
                    padding: 16px;
                    border-radius: 12px;
                    text-decoration: none;
                    cursor: pointer;
                }
                a:hover,
                a:focus {
                    background-color: ${theme.primary050};
                    cursor: pointer;
                }
                a:hover > div {
                    font-weight: 500;
                    cursor: pointer;
                }
                .app-icon {
                    width: 48px;
                    height: 48px;
                    cursor: pointer;
                }
                .app-name {
                    margin-top: 14px;
                    color: rgba(0, 0, 0, 0.87);
                    font-size: 14px;
                    letter-spacing: 0.01em;
                    line-height: 16px;
                    text-align: center;
                    cursor: pointer;
                }
            `}</style>
        </a>
    </div>
)

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

export default DraggableApp
