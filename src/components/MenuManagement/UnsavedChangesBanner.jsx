import { NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import i18n from '../../locales/index.js'
import classes from './UnsavedChangesBanner.module.css'

/**
 * Sits directly under the page header, in normal flow above the card — it
 * pushes the card down when it appears rather than overlaying it, so it
 * never covers any of the card's content (the card's own flex sizing just
 * absorbs whatever space is left, automatically). NoticeBox rather than
 * AlertBar: AlertBar is built for toasts and bakes in a slide-up-from-the-
 * bottom mount animation (see @dhis2-ui/alert's alert-bar.styles.js —
 * `slidein`/`slideout` keyframes translating from 1000px), which replays on
 * every mount and reads as excessive for a message that's meant to just sit
 * in place. NoticeBox has no such animation and is the library's own
 * static, inline notice component.
 */
const UnsavedChangesBanner = ({ isDirty }) => {
    if (!isDirty) {
        return null
    }

    return (
        <div className={classes.wrap}>
            <NoticeBox warning dataTest="menu-management-unsaved-banner">
                {i18n.t('You have unsaved changes.')}
            </NoticeBox>
        </div>
    )
}

UnsavedChangesBanner.propTypes = {
    isDirty: PropTypes.bool.isRequired,
}

export default UnsavedChangesBanner
