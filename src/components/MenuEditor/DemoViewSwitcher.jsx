import { SegmentedControl } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import classes from './DemoViewSwitcher.module.css'

/**
 * Demo-only floating control for switching between the current layout and
 * the prototypes. Not translated on purpose — it is not part of the product.
 */
const DemoViewSwitcher = ({ view, onChange }) => (
    <div className={classes.switcher}>
        <span className={classes.label}>Demo</span>
        <SegmentedControl
            options={[
                { label: 'V1', value: '1' },
                { label: 'V1.1 (outlined)', value: '1.1' },
                { label: 'V2 (simple)', value: '2' },
                { label: 'V3 (old)', value: '3' },
            ]}
            selected={view}
            onChange={({ value }) => onChange(value)}
            ariaLabel="Demo view"
        />
    </div>
)

DemoViewSwitcher.propTypes = {
    view: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default DemoViewSwitcher
