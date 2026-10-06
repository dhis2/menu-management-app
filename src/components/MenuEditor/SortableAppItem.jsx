import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PropTypes from 'prop-types'
import React from 'react'
import i18n from '../../locales/index.js'
import classes from './SortableAppItem.module.css'

/**
 * One app, rendered as a grid tile. Both "Top apps" and "All other apps"
 * use this same shape, so an app crossing between them only ever changes
 * which of the two <ol> trees it's a child of (see MenuEditor.jsx's two
 * Zones) — it doesn't also need to change shape mid-drag.
 */
const SortableAppItem = ({ app, index, total }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: app.name })

    const label = app.displayName || app.name

    return (
        <li
            ref={setNodeRef}
            style={{
                // Translate, not Transform: rectSortingStrategy would
                // otherwise scale tiles to their neighbours' sizes.
                transform: CSS.Translate.toString(transform),
                transition,
            }}
            className={[classes.item, isDragging ? classes.isDragging : '']
                .filter(Boolean)
                .join(' ')}
        >
            <button
                type="button"
                className={classes.tile}
                {...attributes}
                {...listeners}
                aria-roledescription={i18n.t('sortable app')}
                aria-label={i18n.t(
                    'Reorder {{name}}. Currently position {{position}} of {{total}}',
                    { name: label, position: index + 1, total }
                )}
            >
                <img className={classes.icon} src={app.icon} alt="" />
                <span className={classes.label}>{label}</span>
            </button>
        </li>
    )
}

SortableAppItem.propTypes = {
    app: PropTypes.shape({
        name: PropTypes.string.isRequired,
        displayName: PropTypes.string,
        icon: PropTypes.string,
    }).isRequired,
    index: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
}

export default SortableAppItem
