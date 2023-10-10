//On mount -> validate refreshtoken and make a new auth token.

import axios from 'axios'
import type { AxiosResponse } from 'axios'
import getProfile from '../user/profile'

import { isLoggedIn, userLoading } from '../../../stores/stores'

import type { Tokens } from '../../../interfaces/user'
import {  setCssFromSettings } from '../../../style/defaultColors'

//Check if token is valid and renew
export const validateToken = async () => {
  let accessToken
  let refreshToken

  const storedRefreshToken = localStorage.getItem('refreshToken')

  //If no refreshToken stored in localstorage -> return undefined and user needs to login
  if (!storedRefreshToken) {
    throw new Error()
  }

  const body = {
    refreshToken: storedRefreshToken,
  }

  userLoading.set(true)

  return await axios
    .post(`http://${location.hostname}:6060/api/v1/auth/refreshToken`, body)
    .then(async (response: AxiosResponse<Tokens>) => {
      if (response.status === 200) {
        accessToken = response.data.accessToken
        refreshToken = response.data.refreshToken
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('accessToken', accessToken)

        return await getProfile()
          .then((user) => {
            isLoggedIn.set(true)
            userLoading.set(false)
            setCssFromSettings(user.theme)
            return user
          })
          .catch((err) => {
            throw new Error(err)
          })
      } else {
        throw new Error()
      }
    })
    .catch((err) => {
      console.log(err)
    })
}
