import * as admin from 'firebase-admin'

import { Contract } from 'common/contract'
import { GroupLink } from 'common/group'
import { createSupabaseClient, SupabaseDirectClient } from './supabase/init'
import {
  UNRANKED_GROUP_ID,
  UNSUBSIDIZED_GROUP_ID,
} from 'common/supabase/groups'
import { recordContractEdit } from 'shared/record-contract-edit'
import { trackPublicEvent } from 'shared/analytics'

const firestore = admin.firestore()

export async function addGroupToContract(
  contract: Contract,
  group: { id: string; slug: string; name: string },
  pg: SupabaseDirectClient,
  recordEdit?: { userId: string }
) {
  const addedToGroupAlready = await pg.one(
    `
    select exists (
      select 1
      from group_contracts
      where group_id = $1
        and contract_id = $2
    )
    `,
    [group.id, contract.id]
  )
  if (!addedToGroupAlready.exists) {
    await pg.none(
      `
     insert into group_contracts (group_id, contract_id)
     values ($1, $2)
     on conflict do nothing
     `,
      [group.id, contract.id]
    )
  }
  const linkedToGroupAlready = (contract?.groupLinks ?? []).some(
    (g) => g.groupId === group.id
  )
  if (!linkedToGroupAlready) {
    // update group slugs and group links
    await firestore
      .collection('contracts')
      .doc(contract.id)
      .update({
        groupSlugs: admin.firestore.FieldValue.arrayUnion(group.slug),
        groupLinks: admin.firestore.FieldValue.arrayUnion({
          groupId: group.id,
          createdTime: Date.now(),
          slug: group.slug,
          name: group.name,
        }),
      })
  }

  if (group.id === UNRANKED_GROUP_ID) {
    await firestore.collection('contracts').doc(contract.id).update({
      isRanked: false,
    })
    if (recordEdit) {
      await recordContractEdit(contract, recordEdit.userId, ['isRanked'])
    }
  }

  if (group.id === UNSUBSIDIZED_GROUP_ID) {
    await firestore.collection('contracts').doc(contract.id).update({
      isSubsidized: false,
    })
    if (recordEdit) {
      await recordContractEdit(contract, recordEdit.userId, ['isSubsidized'])
    }
  }

  await trackPublicEvent(
    recordEdit?.userId ?? contract.creatorId,
    'add market to topic',
    {
      contractId: contract.id,
      groupSlug: group.slug,
      inCreateMarket: !recordEdit,
    }
  )

  return !(linkedToGroupAlready && addedToGroupAlready)
}

export async function removeGroupFromContract(
  contract: Contract,
  group: { id: string; slug: string },
  userId: string
) {
  const db = createSupabaseClient()

  // delete from group_contracts table
  await db
    .from('group_contracts')
    .delete()
    .eq('contract_id', contract.id)
    .eq('group_id', group.id)

  // update group slugs and group links
  const newLinks = contract.groupLinks?.filter(
    (l: GroupLink) => l.groupId !== group.id
  )
  await firestore
    .collection('contracts')
    .doc(contract.id)
    .update({
      groupSlugs: admin.firestore.FieldValue.arrayRemove(group.slug),
      groupLinks: newLinks,
    })

  if (group.id === UNRANKED_GROUP_ID) {
    await firestore.collection('contracts').doc(contract.id).update({
      isRanked: true,
    })
    await recordContractEdit(contract, userId, ['isRanked'])
  }
  if (group.id === UNSUBSIDIZED_GROUP_ID) {
    await firestore.collection('contracts').doc(contract.id).update({
      isSubsidized: true,
    })
    await recordContractEdit(contract, userId, ['isSubsidized'])
  }
  await trackPublicEvent(userId, 'remove market from topic', {
    contractId: contract.id,
    groupSlug: group.slug,
  })
}
