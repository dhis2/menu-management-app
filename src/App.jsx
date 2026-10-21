import { CssVariables, IconInfo16, Tooltip, colors } from '@dhis2/ui'
import React, { useCallback, useState } from 'react'
import classes from './App.module.css'
import DemoViewSwitcher from './components/MenuEditor/DemoViewSwitcher.jsx'
import MenuEditor from './components/MenuEditor/MenuEditor.jsx'
import MenuManagement from './components/MenuManagement/MenuManagement.jsx'
import i18n from './locales/index.js'

// Demo only. Values match the labels in DemoViewSwitcher. ?view=1 (the
// default) is the main editor — Top apps as a grid, All other apps as a list
// — with grips on white app cards set against grey plates. ?view=1.1 has the
// same grips, but card borders on white plates instead. ?view=2 has no grips
// or borders at all. ?view=3 is the old list + preview layout. Anything else
// opens the main editor.
const VIEWS = ['1', '1.1', '2', '3']

const EDITOR_VARIANTS = {
    1: 'filled',
    1.1: 'outlined',
    2: 'plain',
}

const readView = () => {
    const view = new URLSearchParams(window.location.search).get('view')
    return VIEWS.includes(view) ? view : '1'
}

// Same hint after the title in both views: the rest of the description
// already covers what the editor does, so this is only the one thing that
// isn't otherwise said — that it's a personal setting, not a shared one.
const TitleHint = () => (
    <Tooltip content={i18n.t('Changes here only affect your own menu.')}>
        <span className={classes.hint}>
            <IconInfo16 color={colors.grey600} />
        </span>
    </Tooltip>
)

const App = () => {
    const [view, setView] = useState(readView)

    const handleViewChange = useCallback((nextView) => {
        const url = new URL(window.location.href)
        url.searchParams.set('view', nextView)
        window.history.replaceState(null, '', url)
        setView(nextView)
    }, [])

    return (
        <>
            <CssVariables spacers colors theme elevations />
            {EDITOR_VARIANTS[view] ? (
                <div
                    className={`${classes.editorContainer} ${classes.containerScroll}`}
                >
                    <header>
                        <h1 className={classes.title}>
                            {i18n.t('Menu Management')}
                            <TitleHint />
                        </h1>
                        <p className={classes.description}>
                            {i18n.t(
                                'Drag apps to reorder them, or move them between groups.'
                            )}
                        </p>
                    </header>
                    <MenuEditor variant={EDITOR_VARIANTS[view]} />
                </div>
            ) : (
                <div className={classes.container}>
                    <header className={classes.header}>
                        <h1 className={classes.title}>
                            {i18n.t('Menu Management')}
                            <TitleHint />
                        </h1>
                    </header>
                    <MenuManagement />
                </div>
            )}
            <DemoViewSwitcher view={view} onChange={handleViewChange} />
        </>
    )
}

export default App
