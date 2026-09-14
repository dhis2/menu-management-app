import { useAlert } from '@dhis2/app-runtime'
import { CenteredContent, CircularLoader, NoticeBox } from '@dhis2/ui'
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useApps } from '../../api/useApps.js'
import { useSaveMenuOrder } from '../../api/useSaveMenuOrder.js'
import { DEFAULT_TOP_APPS_COUNT } from '../../constants.js'
import i18n from '../../locales/index.js'
import { createAnnouncements } from './announcements.js'
import AppList from './AppList.jsx'
import classes from './MenuManagement.module.css'
import SaveBar from './SaveBar.jsx'
import TopAppsPreview from './TopAppsPreview.jsx'
import { useMenuOrder } from './useMenuOrder.js'

const MenuManagement = () => {
    const { loading, error, appsByName, order: savedOrder } = useApps()
    const saveMenuOrder = useSaveMenuOrder()
    const state = useMenuOrder()

    const [saving, setSaving] = useState(false)
    const [activeId, setActiveId] = useState(null)
    // Local only — there is nowhere to persist this yet, so it is kept out
    // of the dirty/save path on purpose (see TopAppsCountControl).
    const [topAppsCount, setTopAppsCount] = useState(DEFAULT_TOP_APPS_COUNT)

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

    // Autosave is gone, so unsaved work can now be lost by navigating away.
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
        (name) => appsByName?.[name]?.displayName || name,
        [appsByName]
    )
    const announcements = useMemo(
        () => createAnnouncements(getLabel),
        [getLabel]
    )

    const { reorder } = state
    const handleDragStart = useCallback(
        ({ active }) => setActiveId(active.id),
        []
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

    const { order, commit } = state
    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await saveMenuOrder(order)
            commit()
            showSuccessAlert()
        } catch (saveError) {
            // Leave local state untouched so Save can simply be retried.
            showErrorAlert(saveError.message)
        } finally {
            setSaving(false)
        }
    }, [order, saveMenuOrder, commit, showSuccessAlert, showErrorAlert])

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

    const activeApp = activeId ? appsByName[activeId] : null

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            accessibility={{ announcements }}
        >
            <div className={classes.zones}>
                <AppList
                    order={order}
                    appsByName={appsByName}
                    topAppsCount={topAppsCount}
                />
                <TopAppsPreview
                    order={order}
                    appsByName={appsByName}
                    topAppsCount={topAppsCount}
                    onTopAppsCountChange={setTopAppsCount}
                />
            </div>

            <SaveBar
                isDirty={isDirty}
                saving={saving}
                onSave={handleSave}
                onReset={state.reset}
            />

            <DragOverlay>
                {activeApp ? (
                    <div className={classes.dragOverlay}>
                        <img
                            className={classes.dragOverlayIcon}
                            src={activeApp.icon}
                            alt=""
                        />
                        <span>{activeApp.displayName || activeApp.name}</span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}

export default MenuManagement
