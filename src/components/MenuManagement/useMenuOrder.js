import { useCallback, useMemo, useReducer } from 'react'
import { DEFAULT_TOP_APPS_COUNT, TOP_MENU_DIVIDER_ID } from '../../constants.js'

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
            // The divider is spliced in as a real array member — see
            // constants.js — so dragging a real app across it can move it,
            // instead of the top/other split being a separate fixed count.
            const dividerIndex = Math.min(
                DEFAULT_TOP_APPS_COUNT,
                action.order.length
            )
            const order = [...action.order]
            order.splice(dividerIndex, 0, TOP_MENU_DIVIDER_ID)
            return {
                status: 'ready',
                order,
                baseline: [...order],
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
            const nextOrder = moveItem(state.order, fromIndex, toIndex)
            // At least one real app must stay pinned to the top menu — the
            // Global Shell always shows something in its top bar. Refuse the
            // move rather than allowing an empty group and validating after
            // the fact.
            if (nextOrder.indexOf(TOP_MENU_DIVIDER_ID) === 0) {
                return state
            }
            return {
                ...state,
                order: nextOrder,
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
 * Owns the single ordered list of app names shown in the left zone, plus the
 * "Top apps" / "Other apps" divider mixed into that same array (see
 * TOP_MENU_DIVIDER_ID in constants.js) — dragging a real app across it moves
 * it exactly like reordering. Ranking is purely array position: `POST
 * /api/menu` replaces the whole list, and the Command Palette shows the
 * first N of it — N is still the Shell's own hard-coded constant, not
 * whatever the divider's position implies, since there is nowhere yet to
 * persist a per-user count (see constants.js). Moving the divider is
 * therefore still a prototype affordance: it changes what gets saved (which
 * apps end up in which relative positions) but not, on its own, how many of
 * them the real Shell will actually show.
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
