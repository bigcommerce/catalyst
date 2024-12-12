'use client'
import React, { FC, useEffect } from 'react'

interface B2BProviderProps {
  b2bToken?: string;
}

const loginToB2b = async (b2bToken: string) => {
    const token = window.b2b.utils.user.getB2BToken()
    if (!b2bToken) {
        if (token) await window.b2b.utils.user.logout()
        return
    }

    if(!token) {
        await window.b2b.utils.user.loginWithB2BStorefrontToken(b2bToken)
    }
}

export default function B2BProvider({ b2bToken }: B2BProviderProps) {
  useEffect(() => {
    const interval = setInterval(() => {
        if (window.b2b?.utils) {
            loginToB2b(b2bToken ?? '')
            clearInterval(interval)
        }
    }, 500)
  }, [])

  return null
}

B2BProvider.displayName = 'B2BProvider'
    