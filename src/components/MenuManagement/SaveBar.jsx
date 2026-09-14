import { Button, ButtonStrip, IconWarningFilled16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import i18n from '../../locales/index.js'
import classes from './SaveBar.module.css'

/**
 * A persistent sticky footer rather than a banner that appears on the first
 * change: the list is long enough to scroll, and controls that move as you
 * work are harder to aim at than controls that are always in the same place.
 */
const SaveBar = ({ isDirty, saving, onSave, onReset }) => (
    <div className={classes.bar}>
        <span className={classes.status}>
            {isDirty && (
                <>
                    <span className={classes.statusIcon} aria-hidden="true">
                        <IconWarningFilled16 />
                    </span>
                    {i18n.t('Unsaved changes')}
                </>
            )}
        </span>
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
