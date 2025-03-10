import { z } from 'zod'

import { isAdminId, isTrustworthy } from 'common/envs/constants'
import { APIError, authEndpoint, validate } from './helpers'
import { createSupabaseClient } from 'shared/supabase/init'
import { getUserSupabase } from 'shared/utils'
import { track } from 'shared/analytics'

const schema = z
  .object({
    dashboardId: z.string(),
  })
  .strict()

export const deletedashboard = authEndpoint(async (req, auth) => {
  const { dashboardId } = validate(schema, req.body)

  const user = await getUserSupabase(auth.uid)
  if (!isAdminId(auth.uid) && !isTrustworthy(user?.username)) {
    throw new APIError(403, 'You are not an admin or mod')
  }

  const db = createSupabaseClient()

  const { error } = await db
    .from('dashboards')
    .update({ visibility: 'deleted', importance_score: 0 })
    .eq('id', dashboardId)

  if (error) {
    throw new APIError(500, 'Failed to delete dashboard' + error.message)
  }

  track(auth.uid, 'delete-dashboard', { dashboardId, username: user?.username })

  return { status: 'success' }
})
