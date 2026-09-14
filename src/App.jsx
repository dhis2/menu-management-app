import { CssVariables } from '@dhis2/ui'
import React from 'react'
import classes from './App.module.css'
import MenuManagement from './components/MenuManagement/MenuManagement.jsx'
import i18n from './locales/index.js'

const App = () => (
    <>
        <CssVariables spacers colors theme />
        <div className={classes.container}>
            <header>
                <h1 className={classes.title}>{i18n.t('Your apps')}</h1>
                <p className={classes.description}>
                    {i18n.t(
                        'Choose which apps appear in your menu and the order they appear in.'
                    )}
                </p>
            </header>
            <MenuManagement />
        </div>
    </>
)

export default App
