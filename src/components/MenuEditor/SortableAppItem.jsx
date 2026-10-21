import { IconDragHandle16 } from '@dhis2/ui'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PropTypes from 'prop-types'
import React from 'react'
import i18n from '../../locales/index.js'
import classes from './SortableAppItem.module.css'

/**
 * The drag grip shown inside every tile and row (and in the DragOverlay
 * copy). Purely visual: the listeners stay on the whole button, so this is
 * not a second tab stop.
 */
export const DragGrip = () => (
    <span className={classes.handle} aria-hidden="true">
        <IconDragHandle16 />
    </span>
)

/**
 * One app. `layout="tile"` is the grid cell used by Top apps.
 * `layout="row"` is the horizontal list row used by All other apps.
 * Crossing between the two sections remounts the item into the other <ol>
 * (see MenuEditor.jsx), which is also what swaps the shape.
 *
 * Double-clicking the button moves the app to the other group; it is the
 * same single tab stop as the drag, so keyboard users are unaffected (Space
 * picks up, arrows move, including across groups).
 *
 * Demo: `variant="plain"` has no grip and no resting border, leaving the
 * description text as the only drag cue; `variant="outlined"` shows a grip
 * and a card border on every tile and row; `variant="filled"` shows the grip
 * on a white card set against a grey plate instead of a border.
 */
const SortableAppItem = ({
    app,
    index,
    total,
    layout = 'tile',
    variant = 'plain',
    onMoveToOtherGroup,
}) => {
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
                // Tiles use Translate, not Transform: rectSortingStrategy
                // would otherwise scale them to their neighbours' sizes.
                // Rows use Transform so verticalListSortingStrategy can
                // shift them without that grid-only scale problem.
                transform:
                    layout === 'row'
                        ? CSS.Transform.toString(transform)
                        : CSS.Translate.toString(transform),
                transition,
            }}
            className={[classes.item, isDragging ? classes.isDragging : '']
                .filter(Boolean)
                .join(' ')}
        >
            <button
                type="button"
                className={[
                    layout === 'row' ? classes.row : classes.tile,
                    variant !== 'plain' ? classes[variant] : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
                {...attributes}
                {...listeners}
                data-app-name={app.name}
                onDoubleClick={() => onMoveToOtherGroup?.(app.name)}
                aria-roledescription={i18n.t('sortable app')}
                aria-label={i18n.t(
                    'Reorder {{name}}. Currently position {{position}} of {{total}}',
                    { name: label, position: index + 1, total }
                )}
            >
                {variant !== 'plain' && <DragGrip />}
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
    layout: PropTypes.oneOf(['tile', 'row']),
    variant: PropTypes.oneOf(['plain', 'outlined', 'filled']),
    onMoveToOtherGroup: PropTypes.func,
}

export default SortableAppItem
