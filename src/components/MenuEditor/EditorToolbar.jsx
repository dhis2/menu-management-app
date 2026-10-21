import { Button, ButtonStrip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import i18n from '../../locales/index.js'
import classes from './EditorToolbar.module.css'

/**
 * Save/Discard toolbar above the editor. Only rendered while there are
 * unsaved changes — its mere presence is the dirty indicator, instead of a
 * separate warning banner or an always-on bar with a tinted "dirty" state.
 * The status is plain text with no icon: unsaved changes are the normal
 * working state of an editor, not a warning, and a yellow icon on every
 * first drag would compete with the Save button for attention. Leaving with
 * changes is already guarded by MenuEditor's beforeunload prompt.
 */
const EditorToolbar = ({ isDirty, saving, onSave, onReset }) => {
    if (!isDirty) {
        return null
    }

    return (
        <div className={classes.toolbar}>
            <span className={classes.status} aria-live="polite">
                {i18n.t('You have unsaved changes')}
            </span>
            <ButtonStrip end>
                <Button
                    secondary
                    disabled={saving}
                    onClick={onReset}
                    dataTest="menu-editor-discard"
                >
                    {i18n.t('Discard changes')}
                </Button>
                <Button
                    primary
                    disabled={saving}
                    loading={saving}
                    onClick={onSave}
                    dataTest="menu-editor-save"
                >
                    {saving ? i18n.t('Saving…') : i18n.t('Save')}
                </Button>
            </ButtonStrip>
        </div>
    )
}

EditorToolbar.propTypes = {
    isDirty: PropTypes.bool.isRequired,
    saving: PropTypes.bool.isRequired,
    onReset: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
}

export default EditorToolbar
