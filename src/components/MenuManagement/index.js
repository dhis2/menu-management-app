import { join as joinPath } from 'path'
import { useDataQuery, useDataMutation, useConfig } from '@dhis2/app-runtime'
import { PropTypes } from '@dhis2/prop-types'
import { NoticeBox, CenteredContent, CircularLoader, Card } from '@dhis2/ui'
import React, { useMemo, useState, useCallback } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import i18n from '../../locales'
import { useAlerts } from '../AlertProvider'
import DraggableApp from './DraggableApp'
import classes from './MenuManagement.module.css'

const query = {
    apps: {
        resource: 'action::menu/getModules',
    },
}

const mutation = {
    resource: 'menu',
    type: 'create',
    data: ({ items }) => items,
}

const moveApp = (apps, app, insertBefore) => {
    const newApps = [...apps]
    const appIndex = newApps.indexOf(app)
    newApps.splice(appIndex, 1)
    const insertBeforeIndex = newApps.indexOf(insertBefore)
    newApps.splice(insertBeforeIndex, 0, app)
    return newApps
}

const MenuManagement = ({ apps, initialAppsOrder }) => {
    const [appsOrder, setAppsOrder] = useState(initialAppsOrder)
    const { showSuccessAlert, showCriticalAlert } = useAlerts()
    const [mutate] = useDataMutation(mutation, {
        onComplete() {
            showSuccessAlert(i18n.t('Updated order of apps.'))
        },
        onError(error) {
            showCriticalAlert(error.message)
        },
    })
    const handleAppMove = useCallback(
        (app, insertBefore) => {
            const newAppsOrder = moveApp(appsOrder, app, insertBefore)
            mutate({ items: newAppsOrder })
            setAppsOrder(newAppsOrder)
        },
        [appsOrder]
    )

    return (
        <Card>
            <DndProvider backend={HTML5Backend}>
                <div className={classes.apps}>
                    {appsOrder.map(appName => (
                        <DraggableApp
                            key={appName}
                            onMove={handleAppMove}
                            app={apps[appName]}
                        />
                    ))}
                </div>
            </DndProvider>
        </Card>
    )
}

MenuManagement.propTypes = {
    apps: PropTypes.object.isRequired,
    initialAppsOrder: PropTypes.array.isRequired,
}

const MenuManagementWrapper = () => {
    const { baseUrl } = useConfig()
    const { loading, error, data } = useDataQuery(query)

    const apps = useMemo(() => {
        const getPath = path =>
            path.startsWith('http:') || path.startsWith('https:')
                ? path
                : joinPath(baseUrl, 'api', path)

        return data?.apps.modules.map(app => ({
            ...app,
            icon: getPath(app.icon),
            defaultAction: getPath(app.defaultAction),
        }))
    }, [data])

    if (loading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    if (error) {
        const msg = i18n.t('Something went wrong whilst loading your apps')

        return (
            <NoticeBox error title={msg}>
                {error.message}
            </NoticeBox>
        )
    }

    const appsByName = {}
    apps.forEach(app => (appsByName[app.name] = app))

    return (
        <MenuManagement
            apps={appsByName}
            initialAppsOrder={apps.map(({ name }) => name)}
        />
    )
}

export default MenuManagementWrapper
