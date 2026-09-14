import i18n from '../../locales/index.js'

/**
 * Screen-reader announcements for @dnd-kit's KeyboardSensor drag flow.
 * `getLabel` resolves an app's display name from its dnd-kit id (its
 * `name`); `getZoneLabel` resolves a human zone name from a dnd-kit
 * container/zone id.
 */
export const createAnnouncements = (getLabel) => ({
    onDragStart({ active }) {
        return i18n.t('Picked up {{name}}.', { name: getLabel(active.id) })
    },
    onDragOver({ active, over }) {
        if (!over) {
            return i18n.t('{{name}} is no longer over a droppable area.', {
                name: getLabel(active.id),
            })
        }
        return i18n.t('{{name}} was moved near {{overName}}.', {
            name: getLabel(active.id),
            overName: getLabel(over.id),
        })
    },
    onDragEnd({ active, over }) {
        if (!over) {
            return i18n.t('{{name}} was dropped.', {
                name: getLabel(active.id),
            })
        }
        return i18n.t('{{name}} was dropped near {{overName}}.', {
            name: getLabel(active.id),
            overName: getLabel(over.id),
        })
    },
    onDragCancel({ active }) {
        return i18n.t('Dragging {{name}} was cancelled.', {
            name: getLabel(active.id),
        })
    },
})
