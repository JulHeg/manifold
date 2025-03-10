import { buildArray } from 'common/util/array'
import { Lover } from 'love/hooks/use-lover'
import { Carousel } from 'web/components/widgets/carousel'
import Image from 'next/image'
import { Modal } from 'web/components/layout/modal'
import { useState } from 'react'
import { User } from 'common/user'
import { Col } from 'web/components/layout/col'
import { SignUpButton } from './nav/love-sidebar'

export default function ProfileCarousel(props: {
  lover: Lover
  currentUser: User | null
}) {
  const { lover, currentUser } = props
  const photoNums = lover.photo_urls ? lover.photo_urls.length : 0

  const [lightboxUrl, setLightboxUrl] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!currentUser) {
    return (
      <Carousel>
        {lover.pinned_url && (
          <div className="h-80 w-[250px] flex-none snap-start">
            <Image
              priority={true}
              src={lover.pinned_url}
              height={360}
              width={240}
              sizes="(max-width: 640px) 100vw, 240px"
              alt=""
              className="h-full cursor-pointer rounded object-cover"
            />
          </div>
        )}
        {photoNums > 0 && (
          <Col className="bg-canvas-100 dark:bg-canvas-0 text-ink-500 relative h-80 w-[250px] flex-none items-center rounded text-6xl ">
            <Col className=" m-auto items-center gap-1">
              <div className="select-none font-semibold">+{photoNums}</div>
              <SignUpButton
                text="Sign up to see"
                size="xs"
                color="none"
                className="dark:text-ink-500 hover:text-primary-500 hover:underline"
              />
            </Col>
          </Col>
        )}
      </Carousel>
    )
  }
  return (
    <>
      <Carousel>
        {buildArray(lover.pinned_url, lover.photo_urls).map((url, i) => {
          return (
            <div key={url} className="h-80 w-[250px] flex-none snap-start">
              <Image
                priority={i < 3}
                src={url}
                height={360}
                width={240}
                sizes="(max-width: 640px) 100vw, 240px"
                alt=""
                className="h-full cursor-pointer rounded object-cover"
                onClick={() => {
                  setLightboxUrl(url)
                  setDialogOpen(true)
                }}
              />
            </div>
          )
        })}
      </Carousel>
      <Modal open={dialogOpen} setOpen={setDialogOpen}>
        <Image src={lightboxUrl} width={1000} height={1000} alt="" />
      </Modal>
    </>
  )
}
