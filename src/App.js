import { CssVariables } from '@dhis2/ui'
import React from 'react'
import classes from './App.module.css'
import AlertProvider from './components/AlertProvider'
import MenuManagement from './components/MenuManagement'
import i18n from './locales'

const App = () => (
    <AlertProvider>
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
    </AlertProvider>
)

export default App
