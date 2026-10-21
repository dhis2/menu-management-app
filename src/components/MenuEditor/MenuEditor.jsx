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
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import PropTypes from 'prop-types'
import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { useApps } from '../../api/useApps.js'
import { useSaveMenuOrder } from '../../api/useSaveMenuOrder.js'
import { TOP_MENU_DIVIDER_ID } from '../../constants.js'
import i18n from '../../locales/index.js'
import { createAnnouncements } from '../MenuManagement/announcements.js'
import { useMenuOrder } from '../MenuManagement/useMenuOrder.js'
import EditorToolbar from './EditorToolbar.jsx'
import classes from './MenuEditor.module.css'
import SortableAppItem, { DragGrip } from './SortableAppItem.jsx'
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
//
// `forcedOverRef` holds the group keyboardCoordinates is crossing into: the
// overlay is then parked on that group's next slot, which may not exist in the
// layout yet (a new grid row), so the group itself is reported as `over`.
const createCollisionDetection = (forcedOverRef) => (args) => {
    if (forcedOverRef.current) {
        return [{ id: forcedOverRef.current }]
    }
    // The keyboard has no pointer. Use the dragged item's top-left corner
    // instead — keyboardCoordinates (below) always lands that corner on the
    // target item. Comparing whole rects (closestCorners) goes wrong across
    // the grid/list boundary, where a tile-shaped overlay is closer to a
    // neighbouring tile than to the full-width row it sits on.
    const { pointerCoordinates, collisionRect } = args
    const hits = pointerWithin(
        pointerCoordinates || !collisionRect
            ? args
            : {
                  ...args,
                  pointerCoordinates: {
                      x: collisionRect.left + 2,
                      y: collisionRect.top + 2,
                  },
              }
    )
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

const findAppButton = (name) =>
    document.querySelector(`[data-app-name="${CSS.escape(name)}"]`)

const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

// Viewport rect of an app's list item, in the shape dnd-kit's coordinate
// getters work with.
const getItemRect = (name) => {
    const node = findAppButton(name)?.closest('li')
    if (!node) {
        return null
    }
    const { top, left, right, bottom, width, height } =
        node.getBoundingClientRect()
    return { top, left, right, bottom, width, height }
}

// Top-left of the cell the next app added to Top apps will occupy: the next
// column of the last row, or the first column of a new row.
const getNextTopSlot = (topNames) => {
    const last = getItemRect(topNames[topNames.length - 1])
    const grid = findAppButton(topNames[0])?.closest('ol')
    if (!last || !grid) {
        return null
    }
    const first = getItemRect(topNames[0])
    const style = getComputedStyle(grid)
    const columns = style.gridTemplateColumns.split(' ').length
    const gapX = parseFloat(style.columnGap) || 0
    const gapY = parseFloat(style.rowGap) || 0
    return topNames.length % columns === 0
        ? { left: first.left, top: last.bottom + gapY }
        : { left: last.right + gapX, top: last.top }
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

// One titled plate. With `titleInside` (variants "outlined" and "filled") the
// title moves into the plate: once every app is its own card, the plate reads
// as the group's container, and a title outside it is left floating above
// it. `filled` turns the plate grey so its white cards stand out.
const EditorSection = ({ className, title, titleInside, filled, children }) => (
    <section className={className}>
        {!titleInside && <h2 className={classes.heading}>{title}</h2>}
        <div
            className={
                filled
                    ? `${classes.plate} ${classes.plateFilled}`
                    : classes.plate
            }
        >
            {titleInside && (
                <h2 className={`${classes.heading} ${classes.headingInside}`}>
                    {title}
                </h2>
            )}
            {children}
        </div>
    </section>
)

EditorSection.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
    filled: PropTypes.bool,
    titleInside: PropTypes.bool,
}

/**
 * The main editor: a single editable view with "Top apps" rendered as a grid
 * and "All other apps" as a vertical list. Same flat `order` + divider model
 * as the list + preview view (see useMenuOrder.js): moving an app between
 * sections is just a reorder across the divider — by drag, by keyboard, or by
 * double-clicking the app.
 *
 * Demo: `variant` picks how the drag affordance is drawn — see
 * SortableAppItem.
 */
const MenuEditor = ({ variant = 'plain' }) => {
    // "outlined" and "filled" share everything but how a card is drawn:
    // grips, titles inside the plates and the same spacing scale.
    const cards = variant !== 'plain'
    const { loading, error, appsByName, order: savedOrder } = useApps()
    const saveMenuOrder = useSaveMenuOrder()
    const state = useMenuOrder()

    const [saving, setSaving] = useState(false)
    const [activeId, setActiveId] = useState(null)
    const [overlaySize, setOverlaySize] = useState(null)
    // The toolbar appearing on the first change pushes the whole page down.
    // Mid-drag that moves every item out from under the cursor/overlay, so
    // its visibility is frozen for the length of a drag.
    const [toolbarFrozen, setToolbarFrozen] = useState(null)
    const [announcement, setAnnouncement] = useState('')
    // Set when a double-click moved an app into the other group's <ol>: the
    // item remounts there, so focus has to be put back on it afterwards.
    const pendingFocusRef = useRef(null)
    // True from a live cross-group move until the next frame after it renders,
    // so the layout jump it causes can't immediately trigger a move back.
    const recentlyMovedRef = useRef(false)
    // 'fresh' from a live cross-group move until the keyboard moves again;
    // see handleDragEnd. The order at drag start, for Escape.
    const crossStateRef = useRef(null)
    const forcedOverRef = useRef(null)
    const collisionDetection = useMemo(
        () => createCollisionDetection(forcedOverRef),
        []
    )
    const orderRef = useRef([])
    const dragStartOrderRef = useRef([])
    // Current group contents, for the keyboard coordinate getter (which is
    // created once, before `topApps`/`otherApps` exist).
    const layoutRef = useRef({ topApps: [], otherApps: [] })
    // Set after a live cross-group move: the keyboard cursor still sits where
    // the move started, so the next key press measures from the item itself.
    const justCrossedRef = useRef(false)

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

    // sortableKeyboardCoordinates picks the closest droppable by geometry,
    // which across the grid/list boundary lands on whichever item or zone
    // happens to be nearest — usually the wrong slot, and the cursor then
    // stays there, so the items next to the boundary can't be reached. Keep
    // moves inside the group the app is in, and cross explicitly instead:
    // Down past the last row of Top apps goes to the first of All other
    // apps; Up past the first of All other apps goes to the last of Top apps.
    const keyboardCoordinates = useCallback((event, args) => {
        const { context } = args
        const { active, droppableContainers } = context
        if (!active || !ARROW_KEYS.includes(event.code)) {
            return sortableKeyboardCoordinates(event, args)
        }
        forcedOverRef.current = null
        const { topApps: top, otherApps: other } = layoutRef.current
        const group = top.includes(active.id) ? top : other

        let { collisionRect } = context
        const wasFresh = justCrossedRef.current
        if (wasFresh) {
            justCrossedRef.current = false
            const rect = getItemRect(active.id)
            if (rect) {
                collisionRect = rect
            }
        }

        const sameGroup = {
            getEnabled: () =>
                droppableContainers
                    .getEnabled()
                    .filter(({ id }) => group.includes(id)),
            get: (id) => droppableContainers.get(id),
        }
        const inGroup = sortableKeyboardCoordinates(event, {
            ...args,
            context: {
                ...context,
                collisionRect,
                droppableContainers: sameGroup,
            },
        })
        if (inGroup) {
            if (wasFresh) {
                crossStateRef.current = 'moved'
            }
            return inGroup
        }

        // Park the overlay exactly where the app will sit after the move, so
        // nothing jumps when it is dropped.
        let rect = null
        if (event.code === 'ArrowDown' && group === top && top.length > 1) {
            rect = other.length ? getItemRect(other[0]) : null
            forcedOverRef.current = ZONE_OTHER
        } else if (event.code === 'ArrowUp' && group === other) {
            rect = getNextTopSlot(top)
            forcedOverRef.current = ZONE_TOP
        }
        if (!rect) {
            forcedOverRef.current = null
            return undefined
        }
        if (wasFresh) {
            crossStateRef.current = 'moved'
        }
        return { x: rect.left, y: rect.top }
    }, [])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 150, tolerance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: keyboardCoordinates,
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

    const { order, reorder, restore, commit } = state
    const dividerIndex = order.indexOf(TOP_MENU_DIVIDER_ID)
    const topApps = useMemo(
        () => order.slice(0, dividerIndex),
        [order, dividerIndex]
    )
    const otherApps = useMemo(
        () => order.slice(dividerIndex + 1),
        [order, dividerIndex]
    )
    layoutRef.current = { topApps, otherApps }
    orderRef.current = order
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
        ({ active }) => {
            crossStateRef.current = null
            forcedOverRef.current = null
            justCrossedRef.current = false
            dragStartOrderRef.current = orderRef.current
            setToolbarFrozen(isDirty)
            setActiveId(active.id)
        },
        [isDirty]
    )
    // Cross-section moves happen live while dragging, so the target
    // section opens up a slot for the app; in-section moves on drop.
    const handleDragOver = useCallback(
        ({ active, over }) => {
            if (!over || recentlyMovedRef.current) {
                return
            }
            const from = containerOf(active.id)
            const to = containerOf(over.id)
            if (!from || !to || from === to) {
                return
            }
            // Always enter the new group at the divider (last of Top apps,
            // first of All other apps), whichever item or zone is under the
            // pointer/keyboard cursor — the same place a double-click puts
            // it. Where it ends up within the group is settled on drop.
            recentlyMovedRef.current = true
            forcedOverRef.current = null
            justCrossedRef.current = true
            crossStateRef.current = 'fresh'
            reorder(active.id, TOP_MENU_DIVIDER_ID)
        },
        [containerOf, reorder]
    )
    const handleDragEnd = useCallback(
        ({ active, over, activatorEvent }) => {
            setActiveId(null)
            setToolbarFrozen(null)
            const justEntered = crossStateRef.current === 'fresh'
            crossStateRef.current = null
            // Only reorder within a group. The move between groups was
            // already done live in handleDragOver; `over` can point back at
            // the old group after the layout shifted, and acting on it here
            // would throw the app back.
            if (
                over &&
                active.id !== over.id &&
                over.id !== ZONE_TOP &&
                over.id !== ZONE_OTHER &&
                containerOf(active.id) === containerOf(over.id) &&
                // With the keyboard, right after crossing, `over` is stale:
                // the layout shifted under the cursor. Dropping then means
                // "at the divider", where the app already is.
                !(activatorEvent?.type === 'keydown' && justEntered)
            ) {
                reorder(active.id, over.id)
            }
        },
        [containerOf, reorder]
    )
    const handleDragCancel = useCallback(() => {
        setActiveId(null)
        setToolbarFrozen(null)
        // Cross-group moves were applied live, so undo them too.
        restore(dragStartOrderRef.current)
    }, [restore])

    const handleMoveToOtherGroup = useCallback(
        (name) => {
            const from = containerOf(name)
            // The reducer refuses to empty Top apps; don't claim a move then.
            if (!from || (from === 'top' && topApps.length === 1)) {
                return
            }
            pendingFocusRef.current = name
            reorder(name, TOP_MENU_DIVIDER_ID)
            setAnnouncement(
                from === 'top'
                    ? i18n.t('{{name}} moved to All other apps.', {
                          name: getLabel(name),
                      })
                    : i18n.t('{{name}} moved to Top apps.', {
                          name: getLabel(name),
                      })
            )
        },
        [containerOf, topApps.length, reorder, getLabel]
    )

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            recentlyMovedRef.current = false
        })
        return () => cancelAnimationFrame(frame)
    }, [order])

    useEffect(() => {
        const name = pendingFocusRef.current
        if (name) {
            pendingFocusRef.current = null
            findAppButton(name)?.focus()
        }
    }, [order])

    // The overlay's wrapper is sized by dnd-kit once, from the node's rect at
    // drag start. When the app crosses into the other group it changes shape
    // (row <-> tile), so re-measure the live node and override the wrapper.
    const activeContainer = activeId ? containerOf(activeId) : null
    useLayoutEffect(() => {
        const node = activeId ? findAppButton(activeId) : null
        if (node) {
            setOverlaySize({
                width: node.offsetWidth,
                height: node.offsetHeight,
            })
        }
    }, [activeId, activeContainer])

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
    const activeIsRow = activeContainer === 'other'

    const topGroup = (
        <SortableContext items={topApps} strategy={rectSortingStrategy}>
            <Zone id={ZONE_TOP} className={classes.grid}>
                {topApps.map((name, index) => (
                    <SortableAppItem
                        key={name}
                        app={appsByName[name]}
                        index={index}
                        total={total}
                        variant={variant}
                        onMoveToOtherGroup={handleMoveToOtherGroup}
                    />
                ))}
            </Zone>
        </SortableContext>
    )

    const otherGroup = (
        <SortableContext
            items={otherApps}
            strategy={verticalListSortingStrategy}
        >
            <Zone
                id={ZONE_OTHER}
                className={[classes.list, cards ? classes.listCards : '']
                    .filter(Boolean)
                    .join(' ')}
            >
                {otherApps.map((name, index) => (
                    <SortableAppItem
                        key={name}
                        app={appsByName[name]}
                        index={topApps.length + index}
                        total={total}
                        layout="row"
                        variant={variant}
                        onMoveToOtherGroup={handleMoveToOtherGroup}
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
                isDirty={toolbarFrozen ?? isDirty}
                saving={saving}
                onSave={handleSave}
                onReset={state.reset}
            />

            <EditorSection
                className={
                    // Flat grey plates read as one group of surfaces, so in
                    // "filled" they can sit closer than the white ones.
                    variant === 'filled'
                        ? `${classes.section} ${classes.sectionTight}`
                        : classes.section
                }
                title={i18n.t('Top apps')}
                titleInside={cards}
                filled={variant === 'filled'}
            >
                {topGroup}
            </EditorSection>

            <EditorSection
                className={classes.section}
                title={i18n.t('All other apps')}
                titleInside={cards}
                filled={variant === 'filled'}
            >
                {otherGroup}
            </EditorSection>

            <div className={classes.srOnly} aria-live="polite">
                {announcement}
            </div>

            <DragOverlay style={overlaySize || undefined}>
                {activeApp && (
                    <div
                        className={[
                            itemClasses.overlay,
                            activeIsRow ? itemClasses.row : itemClasses.tile,
                            cards ? itemClasses[variant] : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {cards && <DragGrip />}
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
    variant: PropTypes.oneOf(['plain', 'outlined', 'filled']),
}

export default MenuEditor
