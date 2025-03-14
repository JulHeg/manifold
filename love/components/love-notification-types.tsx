import { getSourceUrl, Notification } from 'common/notification'
import {
  AvatarNotificationIcon,
  NotificationFrame,
  PrimaryNotificationLink,
} from 'web/components/notifications/notification-helpers'
import { Linkify } from 'web/components/widgets/linkify'
import { UserLink } from 'web/components/widgets/user-link'

export function CommentOnLoverNotification(props: {
  notification: Notification
  highlighted: boolean
  setHighlighted: (highlighted: boolean) => void
  isChildOfGroup?: boolean
}) {
  const { notification, isChildOfGroup, highlighted, setHighlighted } = props
  const { sourceUserName, sourceUserUsername, sourceText } = notification
  const reasonText = `commented `
  return (
    <NotificationFrame
      notification={notification}
      isChildOfGroup={isChildOfGroup}
      highlighted={highlighted}
      setHighlighted={setHighlighted}
      icon={
        <AvatarNotificationIcon notification={notification} symbol={'💬'} />
      }
      subtitle={
        <div className="line-clamp-2">
          <Linkify text={sourceText} />
        </div>
      }
      link={notification.sourceSlug}
    >
      <div className="line-clamp-3">
        <UserLink
          name={sourceUserName || ''}
          username={sourceUserUsername || ''}
          className={'hover:text-primary-500 relative flex-shrink-0'}
        />{' '}
        {reasonText}
        {!isChildOfGroup && <span>on your profile</span>}
      </div>
    </NotificationFrame>
  )
}

// TODO: I could see people thinking the match proposer is the person they matched with
export function NewMatchNotification(props: {
  notification: Notification
  highlighted: boolean
  setHighlighted: (highlighted: boolean) => void
  isChildOfGroup?: boolean
}) {
  const { notification, isChildOfGroup, highlighted, setHighlighted } = props
  const {
    sourceContractTitle,
    sourceText,
    sourceUserName,
    sourceUserUsername,
  } = notification
  return (
    <NotificationFrame
      notification={notification}
      isChildOfGroup={isChildOfGroup}
      highlighted={highlighted}
      setHighlighted={setHighlighted}
      icon={
        <AvatarNotificationIcon notification={notification} symbol={'🌟'} />
      }
      link={getSourceUrl(notification)}
      subtitle={
        <div className="line-clamp-2">
          <Linkify text={sourceText} />
        </div>
      }
    >
      <div className="line-clamp-3">
        <UserLink
          name={sourceUserName || ''}
          username={sourceUserUsername || ''}
          className={'hover:text-primary-500 relative flex-shrink-0'}
        />{' '}
        <span>
          proposed a new match:{' '}
          <PrimaryNotificationLink text={sourceContractTitle} />
        </span>
      </div>
    </NotificationFrame>
  )
}
