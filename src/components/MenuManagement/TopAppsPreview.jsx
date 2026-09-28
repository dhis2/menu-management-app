import PropTypes from 'prop-types'
import React from 'react'
import i18n from '../../locales/index.js'
import classes from './TopAppsPreview.module.css'

/**
 * The right zone: a read-only mirror of the first N apps, laid out the way
 * the Global Shell's Command Palette lays them out. No drag targets here —
 * everything is edited on the left, this only shows the result. Rendered as
 * a tinted inset panel inside the shared card (see MenuManagement.jsx), not
 * its own separate Card — the two zones are one section.
 */
const TopAppsPreview = ({ order, appsByName, topAppsCount }) => {
    const topApps = order.slice(0, topAppsCount)

    return (
        <div className={classes.sticky}>
            <div className={classes.zone}>
                <div className={classes.header}>
                    <h2 className={classes.heading}>
                        {i18n.t('Top menu preview')}
                    </h2>
                </div>

                <div className={classes.gridPlate}>
                    <ul
                        className={classes.grid}
                        aria-label={i18n.t('Top menu preview')}
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
            </div>
        </div>
    )
}

TopAppsPreview.propTypes = {
    appsByName: PropTypes.object.isRequired,
    order: PropTypes.arrayOf(PropTypes.string).isRequired,
    topAppsCount: PropTypes.number.isRequired,
}

export default TopAppsPreview
