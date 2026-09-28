import PropTypes from 'prop-types'
import React from 'react'
import classes from './SectionHeading.module.css'

/**
 * A label for one segment of the app list — "Top apps" above the apps
 * pinned to the top menu, "Other apps" above the rest. There is no control
 * next to it: moving an app between the two groups is done purely by
 * dragging it across this boundary, the same way reordering within a group
 * already works. It scrolls along with the rows around it rather than
 * staying pinned, like a group label in the Global Shell's own menu.
 */
const SectionHeading = ({ children }) => (
    <li className={classes.heading} role="heading" aria-level="3">
        {children}
    </li>
)

SectionHeading.propTypes = {
    children: PropTypes.node.isRequired,
}

export default SectionHeading
