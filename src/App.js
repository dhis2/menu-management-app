import { spacers } from '@dhis2/ui-constants'
import React from 'react'
import classes from './App.module.css'
import i18n from './locales'
import MenuManagement from './MenuManagement'

const App = () => (
    <div className={classes.container}>
        <header>
            <h1 className={'title'}>{i18n.t('Your apps')}</h1>
            <p className={'description'}>
                {i18n.t('Drag and drop the menu items to re-order them.')}
            </p>
        </header>
        <MenuManagement />

        <style jsx>{`
            .title {
                margin-top: 0;
                margin-bottom: ${spacers.dp8};
            }
            .description {
            }
        `}</style>
    </div>
)

export default App
