import React from 'react'
import i18n from '../../locales/index.js'
import classes from './CutLine.module.css'

/**
 * Marks where the Top apps grid stops, so the consequence of a drag is
 * visible in the list itself and not only in the preview beside it.
 */
const CutLine = () => (
    <li className={classes.cutLine} role="separator">
        <hr className={classes.rule} />
        <span className={classes.label}>
            {i18n.t('Not included in the Top apps grid')}
        </span>
        <hr className={classes.rule} />
    </li>
)

export default CutLine
