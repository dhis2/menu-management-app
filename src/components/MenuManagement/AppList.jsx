import { Card } from '@dhis2/ui'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import i18n from '../../locales/index.js'
import classes from './AppList.module.css'
import AppRow from './AppRow.jsx'
import CutLine from './CutLine.jsx'

/**
 * The left zone: the one ordered list that everything else derives from.
 * The cut line is injected after the last app that still fits in the Top
 * apps grid.
 */
const AppList = ({ order, appsByName, topAppsCount }) => {
    const showCutLine = order.length > topAppsCount

    return (
        <Card>
            <div className={classes.zone}>
                <div className={classes.header}>
                    <h2 className={classes.heading}>{i18n.t('All apps')}</h2>
                    <span className={classes.count}>
                        {i18n.t('{{total}} apps', { total: order.length })}
                    </span>
                </div>
                <p className={classes.hint}>
                    {i18n.t('Drag to reorder, or use your keyboard.')}
                </p>

                <SortableContext
                    items={order}
                    strategy={verticalListSortingStrategy}
                >
                    <ol className={classes.list}>
                        {order.map((name, index) => (
                            <Fragment key={name}>
                                <AppRow
                                    app={appsByName[name]}
                                    index={index}
                                    total={order.length}
                                />
                                {showCutLine && index === topAppsCount - 1 && (
                                    <CutLine />
                                )}
                            </Fragment>
                        ))}
                    </ol>
                </SortableContext>
            </div>
        </Card>
    )
}

AppList.propTypes = {
    appsByName: PropTypes.object.isRequired,
    order: PropTypes.arrayOf(PropTypes.string).isRequired,
    topAppsCount: PropTypes.number.isRequired,
}

export default AppList
