import { Col } from 'web/components/layout/col'
import clsx from 'clsx'
import { Row } from 'web/components/layout/row'
import { Avatar } from 'web/components/widgets/avatar'
import { RelativeTimestamp } from 'web/components/relative-timestamp'
import { Content } from 'web/components/widgets/editor'
import { User } from 'common/user'
import { ChatMessage } from 'common/chat-message'
import { first, last } from 'lodash'
import { memo, useState } from 'react'
import { MultipleOrSingleAvatars } from 'web/components/multiple-or-single-avatars'
import { Modal, MODAL_CLASS } from 'web/components/layout/modal'
import { UserAvatarAndBadge } from 'web/components/widgets/user-link'

export const ChatMessageItem = memo(function ChatMessageItem(props: {
  chats: ChatMessage[]
  currentUser: User | undefined | null
  otherUser?: User | null
  onReplyClick?: (chat: ChatMessage) => void
  beforeSameUser: boolean
  firstOfUser: boolean
}) {
  const { chats, currentUser, otherUser, beforeSameUser, firstOfUser } = props
  const chat = first(chats)
  if (!chat) return null
  const isMe = currentUser?.id === chat.userId
  const { username, avatarUrl, name } =
    !isMe && otherUser
      ? otherUser
      : isMe && currentUser
      ? currentUser
      : { username: '', avatarUrl: undefined, name: '' }

  return (
    <Row
      className={clsx(
        'items-end justify-start gap-1',
        isMe && 'flex-row-reverse',
        firstOfUser ? 'mt-2' : ''
      )}
    >
      {!isMe && (
        <MessageAvatar
          beforeSameUser={beforeSameUser}
          username={username}
          userAvatarUrl={avatarUrl}
        />
      )}
      <Col className="max-w-[calc(100vw-6rem)] md:max-w-[80%]">
        {firstOfUser && !isMe && chat.visibility !== 'system_status' && (
          <span className="text-ink-500 dark:text-ink-600 pl-3 text-sm">
            {name}
          </span>
        )}
        <Col className="gap-1">
          {chats.map((chat) => (
            <div
              className={clsx(
                'group flex items-end gap-1',
                isMe && 'flex-row-reverse'
              )}
              key={chat.id}
            >
              <div
                className={clsx(
                  'rounded-3xl px-3 py-2',
                  chat.visibility !== 'system_status' && 'drop-shadow-sm',
                  chat.visibility === 'system_status'
                    ? 'bg-canvas-50 italic  drop-shadow-none'
                    : isMe
                    ? 'bg-primary-100 items-end self-end rounded-r-none group-first:rounded-tr-3xl'
                    : 'bg-canvas-0 items-start self-start rounded-l-none group-first:rounded-tl-3xl'
                )}
              >
                <Content size={'sm'} content={chat.content} key={chat.id} />
              </div>
              <RelativeTimestamp
                time={chat.createdTime}
                shortened
                className="mb-2 mr-1 hidden text-xs group-last:block"
              />
            </div>
          ))}
        </Col>
      </Col>
      <div className={clsx(isMe ? 'pr-1' : '', 'pb-2')}></div>
    </Row>
  )
})

export const SystemChatMessageItem = memo(
  function SystemChatMessageItem(props: {
    chats: ChatMessage[]
    otherUsers: User[] | undefined
  }) {
    const { chats, otherUsers } = props
    const chat = last(chats)
    const [showUsers, setShowUsers] = useState(false)
    if (!chat) return null

    const totalUsers = otherUsers?.length || 1
    return (
      <Row className={clsx('flex-row-reverse gap-1')}>
        <Row className="grow" />
        <Col className={clsx('grow-y justify-end pb-2')}>
          <RelativeTimestamp
            time={chat.createdTime}
            shortened
            className="text-xs"
          />
        </Col>
        <Col className="max-w-[calc(100vw-6rem)] md:max-w-[80%]">
          <Col
            className={clsx(
              ' bg-canvas-50 px-1 py-2 text-sm italic drop-shadow-none'
            )}
          >
            <span>
              {totalUsers > 1
                ? `${totalUsers} user${totalUsers > 1 ? 's' : ''}`
                : first(otherUsers)?.name}{' '}
              joined the chat!
            </span>
          </Col>
        </Col>
        <MultipleOrSingleAvatars
          size={'sm'}
          spacing={0.2}
          startLeft={0.8}
          avatarUrls={otherUsers?.map((u) => u.avatarUrl) || []}
          onClick={() => setShowUsers(true)}
        />
        {showUsers && (
          <MultiUserModal
            showUsers={showUsers}
            setShowUsers={setShowUsers}
            otherUsers={otherUsers ?? []}
          />
        )}
      </Row>
    )
  }
)
export const MultiUserModal = (props: {
  showUsers: boolean
  setShowUsers: (show: boolean) => void
  otherUsers: User[]
}) => {
  const { showUsers, setShowUsers, otherUsers } = props
  return (
    <Modal open={showUsers} setOpen={setShowUsers}>
      <Col className={clsx(MODAL_CLASS)}>
        {otherUsers?.map((user) => (
          <Row
            key={user.id}
            className={'w-full items-center justify-start gap-2'}
          >
            <UserAvatarAndBadge
              name={user.name}
              username={user.username}
              avatarUrl={user.avatarUrl}
            />
          </Row>
        ))}
      </Col>
    </Modal>
  )
}

function MessageAvatar(props: {
  beforeSameUser: boolean
  userAvatarUrl?: string
  username?: string
}) {
  const { beforeSameUser, userAvatarUrl, username } = props
  return (
    <Col
      className={clsx(
        beforeSameUser ? 'pointer-events-none invisible' : '',
        'grow-y justify-end pb-2 pr-1'
      )}
    >
      <Avatar avatarUrl={userAvatarUrl} username={username} size="xs" />
    </Col>
  )
}
