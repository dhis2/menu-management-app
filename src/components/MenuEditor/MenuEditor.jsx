import { useAlert } from '@dhis2/app-runtime'
import { CenteredContent, CircularLoader, NoticeBox } from '@dhis2/ui'
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    MeasuringStrategy,
    PointerSensor,
    TouchSensor,
    closestCorners,
    pointerWithin,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    rectSortingStrategy,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useApps } from '../../api/useApps.js'
import { useSaveMenuOrder } from '../../api/useSaveMenuOrder.js'
import { TOP_MENU_DIVIDER_ID } from '../../constants.js'
import i18n from '../../locales/index.js'
import { createAnnouncements } from '../MenuManagement/announcements.js'
import { useMenuOrder } from '../MenuManagement/useMenuOrder.js'
import EditorToolbar from './EditorToolbar.jsx'
import classes from './MenuEditor.module.css'
import SortableAppItem from './SortableAppItem.jsx'
import itemClasses from './SortableAppItem.module.css'

const ZONE_TOP = '__zone-top__'
const ZONE_OTHER = '__zone-other__'

// Prefer the item under the pointer; fall back to the section itself (its
// empty space), then to the nearest item. The last fallback is
// closestCorners rather than closestCenter deliberately: dnd-kit's own
// multiple-containers guidance calls out closestCenter as unreliable once
// containers (or the items in them) differ in size — Top apps and All
// other apps are two separate grids that can end up holding very different
// numbers of items, so their empty space differs in size and position.
// closestCorners compares corners instead and tolerates that mismatch.
const collisionDetection = (args) => {
    const hits = pointerWithin(args)
    const items = hits.filter(({ id }) => id !== ZONE_TOP && id !== ZONE_OTHER)
    if (items.length) {
        return items
    }
    if (hits.length) {
        return hits
    }
    return closestCorners(args)
}

// The list/grid a dragged item leaves changes height as it loses a row; the
// one it joins changes height as it gains one. Without continuous
// remeasuring, dnd-kit only measures droppables once up front and collision
// detection drifts out of sync with the actual layout mid-drag.
const measuring = {
    droppable: { strategy: MeasuringStrategy.Always },
}

// Just a droppable landing target for the section's own empty space — no
// hover/active styling of its own; see the "remove the zone highlight"
// decision in MenuEditor.module.css's history for why.
const Zone = ({ id, className, children }) => {
    const { setNodeRef } = useDroppable({ id })
    return (
        <ol ref={setNodeRef} className={className}>
            {children}
        </ol>
    )
}

Zone.propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
}

/**
 * Demo view 2: a single editable view instead of editor + preview, with
 * both "Top apps" and "All other apps" rendered as grids. Same flat `order`
 * + divider model as V1 (see useMenuOrder.js): moving an app between
 * sections is just a reorder across the divider.
 *
 * Demo view 3 (`variant="combined"`) is the same editor and the same two
 * separate plates as V2, just with each group's heading moved inside its
 * own card instead of sitting above it — drag, drop and save behaviour are
 * identical, only the heading's position relative to .plate differs.
 */
const MenuEditor = ({ variant = 'split' }) => {
    const { loading, error, appsByName, order: savedOrder } = useApps()
    const saveMenuOrder = useSaveMenuOrder()
    const state = useMenuOrder()

    const [saving, setSaving] = useState(false)
    const [activeId, setActiveId] = useState(null)

    const { show: showSuccessAlert } = useAlert(i18n.t('Apps menu saved.'), {
        success: true,
    })
    const { show: showErrorAlert } = useAlert((message) => message, {
        critical: true,
    })

    const { init } = state
    const initializedRef = useRef(false)
    useEffect(() => {
        if (!initializedRef.current && savedOrder) {
            initializedRef.current = true
            init(savedOrder)
        }
    }, [savedOrder, init])

    const { isDirty } = state
    useEffect(() => {
        if (!isDirty) {
            return undefined
        }
        const handler = (event) => {
            event.preventDefault()
            event.returnValue = ''
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [isDirty])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 150, tolerance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const getLabel = useCallback(
        (name) => {
            if (name === ZONE_TOP) {
                return i18n.t('Top apps')
            }
            if (name === ZONE_OTHER) {
                return i18n.t('All other apps')
            }
            return appsByName?.[name]?.displayName || name
        },
        [appsByName]
    )
    const announcements = useMemo(
        () => createAnnouncements(getLabel),
        [getLabel]
    )

    const { order, reorder, commit } = state
    const dividerIndex = order.indexOf(TOP_MENU_DIVIDER_ID)
    const topApps = useMemo(
        () => order.slice(0, dividerIndex),
        [order, dividerIndex]
    )
    const otherApps = useMemo(
        () => order.slice(dividerIndex + 1),
        [order, dividerIndex]
    )
    const realOrder = useMemo(
        () => order.filter((name) => name !== TOP_MENU_DIVIDER_ID),
        [order]
    )

    const containerOf = useCallback(
        (id) => {
            if (id === ZONE_TOP) {
                return 'top'
            }
            if (id === ZONE_OTHER) {
                return 'other'
            }
            const index = order.indexOf(id)
            if (index === -1) {
                return null
            }
            return index < dividerIndex ? 'top' : 'other'
        },
        [order, dividerIndex]
    )

    const handleDragStart = useCallback(
        ({ active }) => setActiveId(active.id),
        []
    )
    // Cross-section moves happen live while dragging, so the target
    // section opens up a slot for the app; in-section moves on drop.
    const handleDragOver = useCallback(
        ({ active, over }) => {
            if (!over) {
                return
            }
            const from = containerOf(active.id)
            const to = containerOf(over.id)
            if (!from || !to || from === to) {
                return
            }
            const isZone = over.id === ZONE_TOP || over.id === ZONE_OTHER
            reorder(active.id, isZone ? TOP_MENU_DIVIDER_ID : over.id)
        },
        [containerOf, reorder]
    )
    const handleDragEnd = useCallback(
        ({ active, over }) => {
            setActiveId(null)
            if (over && active.id !== over.id) {
                reorder(active.id, over.id)
            }
        },
        [reorder]
    )
    const handleDragCancel = useCallback(() => setActiveId(null), [])

    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await saveMenuOrder(realOrder)
            commit()
            showSuccessAlert()
        } catch (saveError) {
            showErrorAlert(saveError.message)
        } finally {
            setSaving(false)
        }
    }, [realOrder, saveMenuOrder, commit, showSuccessAlert, showErrorAlert])

    if (loading || state.status === 'loading') {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    if (error) {
        return (
            <NoticeBox
                error
                title={i18n.t('Something went wrong whilst loading your apps')}
            >
                {error.message}
            </NoticeBox>
        )
    }

    const total = realOrder.length
    const activeApp = activeId ? appsByName[activeId] : null
    const combined = variant === 'combined'

    const topGroup = (
        <SortableContext items={topApps} strategy={rectSortingStrategy}>
            <Zone id={ZONE_TOP} className={classes.grid}>
                {topApps.map((name, index) => (
                    <SortableAppItem
                        key={name}
                        app={appsByName[name]}
                        index={index}
                        total={total}
                    />
                ))}
            </Zone>
        </SortableContext>
    )

    const otherGroup = (
        <SortableContext items={otherApps} strategy={rectSortingStrategy}>
            <Zone id={ZONE_OTHER} className={classes.grid}>
                {otherApps.map((name, index) => (
                    <SortableAppItem
                        key={name}
                        app={appsByName[name]}
                        index={topApps.length + index}
                        total={total}
                    />
                ))}
            </Zone>
        </SortableContext>
    )

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            measuring={measuring}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            accessibility={{ announcements }}
        >
            <EditorToolbar
                isDirty={isDirty}
                saving={saving}
                onSave={handleSave}
                onReset={state.reset}
            />

            {combined ? (
                <>
                    <section
                        className={`${classes.section} ${classes.sectionGapCombined}`}
                    >
                        <div className={classes.plate}>
                            <h2 className={classes.heading}>
                                {i18n.t('Top apps')}
                            </h2>
                            {topGroup}
                        </div>
                    </section>

                    <section className={classes.section}>
                        <div className={classes.plate}>
                            <h2 className={classes.heading}>
                                {i18n.t('All other apps')}
                            </h2>
                            {otherGroup}
                        </div>
                    </section>
                </>
            ) : (
                <>
                    <section
                        className={`${classes.section} ${classes.sectionGap}`}
                    >
                        <h2 className={classes.heading}>
                            {i18n.t('Top apps')}
                        </h2>
                        <div className={classes.plate}>{topGroup}</div>
                    </section>

                    <section className={classes.section}>
                        <h2 className={classes.heading}>
                            {i18n.t('All other apps')}
                        </h2>
                        <div className={classes.plate}>{otherGroup}</div>
                    </section>
                </>
            )}

            <DragOverlay>
                {activeApp && (
                    <div
                        className={[itemClasses.overlay, itemClasses.tile].join(
                            ' '
                        )}
                    >
                        <img
                            className={itemClasses.icon}
                            src={activeApp.icon}
                            alt=""
                        />
                        <span className={itemClasses.label}>
                            {activeApp.displayName || activeApp.name}
                        </span>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    )
}

MenuEditor.propTypes = {
    variant: PropTypes.oneOf(['split', 'combined']),
}

export default MenuEditor
