import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import { useMemo } from 'react'

// Legacy Struts endpoint (kept from the original app implementation, fixed in
// commit 296ca1b for https://dhis2.atlassian.net/browse/DHIS2-19124). The
// documented modern equivalent is `GET /api/apps/menu`, which also returns
// `shortcuts` and `displayDescription` — but switching to it needs to be
// verified against a live instance first (see plan risks), so we keep the
// endpoint this app already relies on.
const query = {
    apps: {
        resource: 'action::menu/getModules',
    },
}

const joinPath = (...parts) => {
    const realParts = parts.filter((part) => !!part)
    return realParts.map((part) => part.replace(/^\/+|\/+$/g, '')).join('/')
}

/**
 * Fetches the current user's full app list (already in their saved menu
 * order) and normalises icon/defaultAction URLs.
 */
export const useApps = () => {
    const { baseUrl } = useConfig()
    const { loading, error, data, refetch } = useDataQuery(query)

    const apps = useMemo(() => {
        if (!data) {
            return undefined
        }

        const getPath = (path) =>
            path && (path.startsWith('http:') || path.startsWith('https:'))
                ? path
                : joinPath(baseUrl, 'api', path)

        return data.apps.modules.map((app) => ({
            ...app,
            icon: getPath(app.icon),
            defaultAction: getPath(app.defaultAction),
        }))
    }, [data, baseUrl])

    const appsByName = useMemo(() => {
        if (!apps) {
            return undefined
        }
        const map = {}
        apps.forEach((app) => {
            map[app.name] = app
        })
        return map
    }, [apps])

    return {
        loading,
        error,
        apps,
        appsByName,
        order: apps?.map(({ name }) => name),
        refetch,
    }
}
