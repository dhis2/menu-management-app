import { join as joinPath } from 'path'
import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import { NoticeBox, CenteredContent, CircularLoader, Card } from '@dhis2/ui'
import React, { useMemo, useState, useCallback } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import i18n from '../../locales'
import App from './App'

const query = {
    apps: {
        resource: 'action::menu/getModules',
    },
}

const MenuManagement = ({ apps, initialAppsOrder }) => {
    const [appsOrder, setAppsOrder] = useState(initialAppsOrder)
    const handleAppMove = useCallback((appName1, appName2) => {
        const index1 = appsOrder.indexOf(appName1)
        const index2 = appsOrder.indexOf(appName2)
        const newAppsOrder = [...appsOrder]
        newAppsOrder[index1] = appName2
        newAppsOrder[index2] = appName1
        setAppsOrder(newAppsOrder)
    }, [appsOrder])

    return (
        <Card>
            <DndProvider backend={HTML5Backend}>
                <div className={'apps'}>
                    {appsOrder.map(appName => (
                        <App key={appName} {...apps[appName]} onMove={handleAppMove} />
                    ))}
                </div>
            </DndProvider>

            <style jsx>{`
                .apps {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    padding: 8px;
                }
            `}</style>
        </Card>
    )
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
    apps.forEach((app) => appsByName[app.name] = app)

    return (
        <MenuManagement
            apps={appsByName}
            initialAppsOrder={apps.map(({ name }) => name)} />
    )
}

export default MenuManagementWrapper
