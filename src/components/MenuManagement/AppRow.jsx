import { IconDragHandle16 } from '@dhis2/ui'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PropTypes from 'prop-types'
import React from 'react'
import i18n from '../../locales/index.js'
import classes from './AppRow.module.css'

/**
 * One app in the ordered list. Deliberately not a link: this page configures
 * the menu, it does not launch apps, and an anchor here would navigate away
 * on a mis-aimed drag.
 *
 * Two ways to reorder:
 *  - drag the handle with a pointer
 *  - focus the handle and use the keyboard (dnd-kit's KeyboardSensor: Space
 *    to pick up, arrow keys to move, Space to drop, Escape to cancel)
 * There is deliberately only one focusable element per row, so Tab moves
 * cleanly from handle to handle down the list.
 */
const AppRow = ({ app, index, total }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: app.name })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const label = app.displayName || app.name
    const position = index + 1

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={[classes.row, isDragging ? classes.isDragging : '']
                .filter(Boolean)
                .join(' ')}
            aria-roledescription={i18n.t('sortable app')}
        >
            <button
                type="button"
                className={classes.handle}
                {...attributes}
                {...listeners}
                aria-label={i18n.t(
                    'Reorder {{name}}. Currently position {{position}} of {{total}}',
                    { name: label, position, total }
                )}
            >
                <IconDragHandle16 />
            </button>

            <img className={classes.icon} src={app.icon} alt="" />
            <span className={classes.name}>{label}</span>
        </li>
    )
}

AppRow.propTypes = {
    app: PropTypes.shape({
        name: PropTypes.string.isRequired,
        displayName: PropTypes.string,
        icon: PropTypes.string,
    }).isRequired,
    index: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
}

export default AppRow
