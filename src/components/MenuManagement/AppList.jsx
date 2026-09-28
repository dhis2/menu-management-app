import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import PropTypes from 'prop-types'
import React from 'react'
import { TOP_MENU_DIVIDER_ID } from '../../constants.js'
import i18n from '../../locales/index.js'
import classes from './AppList.module.css'
import AppRow from './AppRow.jsx'
import SectionHeading from './SectionHeading.jsx'

/**
 * The left zone: the one ordered list that everything else derives from.
 * "Top apps" and "Other apps" are plain group labels inline in the list —
 * "Other apps" is the divider, a real (non-draggable) member of `order`, so
 * dragging a real app across it grows or shrinks the top group as a side
 * effect of the reorder, the same way moving past any other item works.
 * Only the <ol> itself scrolls internally (see AppList.module.css); the
 * heading and hint stay in view. Rendered as a plain panel inside the
 * shared card (see MenuManagement.jsx), not its own separate Card.
 */
const AppList = ({ order, appsByName }) => {
    const realTotal = order.length - 1
    let realIndex = 0

    return (
        <div className={classes.zone}>
            <h2 className={classes.heading}>{i18n.t('All apps')}</h2>

            <p className={classes.hint}>
                {i18n.t(
                    'Drag apps to reorder them, or to move them between groups.'
                )}
            </p>

            <SortableContext
                items={order}
                strategy={verticalListSortingStrategy}
            >
                <ol className={classes.list}>
                    <SectionHeading>{i18n.t('Top apps')}</SectionHeading>
                    {order.map((name) => {
                        if (name === TOP_MENU_DIVIDER_ID) {
                            return (
                                <SectionHeading key={name}>
                                    {i18n.t('Other apps')}
                                </SectionHeading>
                            )
                        }
                        const index = realIndex++
                        return (
                            <AppRow
                                key={name}
                                app={appsByName[name]}
                                index={index}
                                total={realTotal}
                            />
                        )
                    })}
                </ol>
            </SortableContext>
        </div>
    )
}

AppList.propTypes = {
    appsByName: PropTypes.object.isRequired,
    order: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default AppList
