import { useDataEngine } from '@dhis2/app-runtime'
import { useCallback } from 'react'

const mutation = {
    resource: 'menu',
    type: 'create',
    data: ({ items }) => items,
}

/**
 * POST /api/menu — persists the full, ordered array of app names for the
 * current user. There is no partial update: the server always replaces the
 * whole list, and derives ranking purely from array position.
 */
export const useSaveMenuOrder = () => {
    const engine = useDataEngine()

    return useCallback(
        (items) => engine.mutate(mutation, { variables: { items } }),
        [engine]
    )
}
