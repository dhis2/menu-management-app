import { Button, ButtonStrip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import i18n from '../../locales/index.js'
import classes from './SaveBar.module.css'

/**
 * Persistent sticky footer for actions only. The unsaved-changes status
 * message lives in UnsavedChangesBanner, directly under the page header, so
 * it stays visible without needing the buttons to scroll along with it.
 */
const SaveBar = ({ isDirty, saving, onSave, onReset }) => (
    <div className={classes.bar}>
        <ButtonStrip end>
            <Button
                secondary
                disabled={!isDirty || saving}
                onClick={onReset}
                dataTest="menu-management-discard"
            >
                {i18n.t('Discard changes')}
            </Button>
            <Button
                primary
                disabled={!isDirty || saving}
                loading={saving}
                onClick={onSave}
                dataTest="menu-management-save"
            >
                {saving ? i18n.t('Saving…') : i18n.t('Save')}
            </Button>
        </ButtonStrip>
    </div>
)

SaveBar.propTypes = {
    isDirty: PropTypes.bool.isRequired,
    saving: PropTypes.bool.isRequired,
    onReset: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
}

export default SaveBar
