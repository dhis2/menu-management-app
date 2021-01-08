import { join as joinPath } from 'path'
import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import { NoticeBox, CenteredContent, CircularLoader, Card } from '@dhis2/ui'
import { theme } from '@dhis2/ui-constants'
import React, { useMemo } from 'react'
import i18n from './locales'

const query = {
    apps: {
        resource: 'action::menu/getModules',
    },
}

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

const MenuManagement = () => {
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

    return (
        <Card>
            <div className={'apps'}>
                {apps.map(app => (
                    <App key={app.name} {...app} />
                ))}
            </div>
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

export default MenuManagement
