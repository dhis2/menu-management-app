import { SingleSelect, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { TOP_APPS_COUNT_OPTIONS } from '../../constants.js'
import i18n from '../../locales/index.js'

/**
 * Prototype control. Changing the value re-slices the preview and moves the
 * cut line, which is the point — but the Global Shell hard-codes its own
 * count and there is no API to store a preference (see constants.js), so
 * this deliberately persists nothing and never marks the form dirty.
 */
const TopAppsCountControl = ({ count, onChange }) => {
    const handleChange = useCallback(
        ({ selected }) => onChange(Number(selected)),
        [onChange]
    )

    return (
        <SingleSelect
            dense
            selected={String(count)}
            onChange={handleChange}
            prefix={i18n.t('Show')}
            dataTest="menu-management-top-apps-count"
        >
            {TOP_APPS_COUNT_OPTIONS.map((option) => (
                <SingleSelectOption
                    key={option}
                    value={String(option)}
                    label={String(option)}
                />
            ))}
        </SingleSelect>
    )
}

TopAppsCountControl.propTypes = {
    count: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default TopAppsCountControl
