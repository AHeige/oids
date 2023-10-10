import axios, { type AxiosResponse } from 'axios'

//Svelte store
import { isLoggedIn, settings, user, userIncludes } from '../../../stores/stores'

//Interface
// import type { User } from '../../../interfaces/user'
import type { Prisma, User } from '@prisma/client'
import { syncThemeWithCss } from '../../../style/defaultColors'
import { DeepMidnight, LightMode } from '../../../style/defaultColors'

const getProfile = async (): Promise<User & Prisma.UserGetPayload<typeof userIncludes>> => {
  const token = localStorage.getItem('accessToken')

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response: User & Prisma.UserGetPayload<typeof userIncludes> = await axios
    .get(`http://${location.hostname}:6060/api/v1/users/profile`, config)
    .then((response: AxiosResponse<User & Prisma.UserGetPayload<typeof userIncludes>>) => {
      user.set(response.data)
      isLoggedIn.set(true)
      console.log('Welcome: ', response.data, response.data)
  syncThemeWithCss(LightMode)

      settings.set({
        theme: {
          name: '',
          bg: '',
          card: '',
          text: '',
          accent: '',
        },
        uiStyle: {
          unarmedShotColor: '',
          armedShotColor: '',
          shipColor: '',
          spaceColor: '',
          starColor: '',
        },
      })

      return response.data
    })
    .catch((err) => {
      throw new Error(err)
    })

  return response
}

export default getProfile
