import { useCallback, useMemo, useReducer } from 'react'

const arraysEqual = (a, b) =>
    a.length === b.length && a.every((value, index) => value === b[index])

const moveItem = (array, fromIndex, toIndex) => {
    const next = [...array]
    const [item] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, item)
    return next
}

const initialState = {
    status: 'loading', // 'loading' | 'ready'
    order: [],
    baseline: [],
}

function reducer(state, action) {
    switch (action.type) {
        case 'INIT': {
            return {
                status: 'ready',
                order: [...action.order],
                baseline: [...action.order],
            }
        }

        case 'REORDER': {
            // Indices are resolved from the names here, against the real
            // array — never trust indices computed in the view layer.
            const { activeName, overName } = action
            const fromIndex = state.order.indexOf(activeName)
            const toIndex = state.order.indexOf(overName)
            if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
                return state
            }
            return {
                ...state,
                order: moveItem(state.order, fromIndex, toIndex),
            }
        }

        case 'RESET': {
            return { ...state, order: [...state.baseline] }
        }

        case 'COMMIT': {
            return { ...state, baseline: [...state.order] }
        }

        default:
            return state
    }
}

/**
 * Owns the single ordered list of app names shown in the left zone. Ranking
 * is purely array position: `POST /api/menu` replaces the whole list, and the
 * Command Palette shows the first N of it.
 *
 * The "top apps count" deliberately lives outside this hook — it cannot be
 * persisted yet (see constants.js), so it must not make the form dirty.
 */
export const useMenuOrder = () => {
    const [state, dispatch] = useReducer(reducer, initialState)

    const init = useCallback((order) => dispatch({ type: 'INIT', order }), [])

    const reorder = useCallback(
        (activeName, overName) =>
            dispatch({ type: 'REORDER', activeName, overName }),
        []
    )

    const reset = useCallback(() => dispatch({ type: 'RESET' }), [])
    const commit = useCallback(() => dispatch({ type: 'COMMIT' }), [])

    const isDirty = useMemo(
        () => !arraysEqual(state.order, state.baseline),
        [state.order, state.baseline]
    )

    return {
        status: state.status,
        order: state.order,
        isDirty,
        init,
        reorder,
        reset,
        commit,
    }
}
