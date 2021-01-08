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
                font-size: 1.5rem;
            }
            .description {
                margin-top: 0;
                margin-bottom: ${spacers.dp16};
                color: rgba(0, 0, 0, 0.87);
            }
        `}</style>
    </div>
)

export default App
