import { Card } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import i18n from '../../locales/index.js'
import TopAppsCountControl from './TopAppsCountControl.jsx'
import classes from './TopAppsPreview.module.css'

/**
 * The right zone: a read-only mirror of the first N apps, laid out the way
 * the Global Shell's Command Palette lays them out. No drag targets here —
 * everything is edited on the left, this only shows the result.
 */
const TopAppsPreview = ({
    order,
    appsByName,
    topAppsCount,
    onTopAppsCountChange,
}) => {
    const topApps = order.slice(0, topAppsCount)

    return (
        <div className={classes.sticky}>
            <Card>
                <div className={classes.zone}>
                    <div className={classes.header}>
                        <h2 className={classes.heading}>
                            {i18n.t('Top apps preview')}
                        </h2>
                        <TopAppsCountControl
                            count={topAppsCount}
                            onChange={onTopAppsCountChange}
                        />
                    </div>

                    <ul
                        className={classes.grid}
                        aria-label={i18n.t('Top apps preview')}
                    >
                        {topApps.map((name) => {
                            const app = appsByName[name]
                            return (
                                <li key={name} className={classes.tile}>
                                    <img
                                        className={classes.icon}
                                        src={app.icon}
                                        alt=""
                                    />
                                    <span className={classes.label}>
                                        {app.displayName || app.name}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </Card>
        </div>
    )
}

TopAppsPreview.propTypes = {
    appsByName: PropTypes.object.isRequired,
    order: PropTypes.arrayOf(PropTypes.string).isRequired,
    topAppsCount: PropTypes.number.isRequired,
    onTopAppsCountChange: PropTypes.func.isRequired,
}

export default TopAppsPreview
