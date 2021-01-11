import { PropTypes } from '@dhis2/prop-types'
import { AlertBar, AlertStack } from '@dhis2/ui'
import React, { useState, useContext, createContext } from 'react'

const AlertContext = createContext()

export const useAlerts = () => useContext(AlertContext)

const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null)
    const showSuccessAlert = message => {
        setAlert({ message, type: 'success', timestamp: Date.now() })
    }
    const showCriticalAlert = message => {
        setAlert({ message, type: 'critical', timestamp: Date.now() })
    }

    return (
        <AlertContext.Provider value={{ showSuccessAlert, showCriticalAlert }}>
            {children}

            <AlertStack>
                {alert
                    ? [
                          <AlertBar
                              key={alert.timestamp}
                              {...{ [alert.type]: true }}
                          >
                              {alert.message}
                          </AlertBar>,
                      ]
                    : null}
            </AlertStack>
        </AlertContext.Provider>
    )
}

AlertProvider.propTypes = {
    children: PropTypes.any.isRequired,
}

export default AlertProvider
