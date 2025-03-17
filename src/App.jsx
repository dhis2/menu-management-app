import { CssVariables } from '@dhis2/ui'
import React from 'react'
import classes from './App.module.css'
import MenuManagement from './components/MenuManagement/index.jsx'
import i18n from './locales/index.js'

const App = () => (
    <>
        <CssVariables spacers theme />
        <div className={classes.container}>
            <header>
                <h1 className={classes.title}>{i18n.t('Your apps')}</h1>
                <p className={classes.description}>
                    {i18n.t('Drag and drop the menu items to re-order them.')}
                </p>
            </header>
            <MenuManagement />
        </div>
    </>
)

export default App
