'use client'

import Card from '@/components/card'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useCenterStore } from '@/hooks/use-center'
import { CARD_SPACING } from '@/consts'
import ScrollOutlineSVG from '@/svgs/scroll-outline.svg'
import ScrollFilledSVG from '@/svgs/scroll-filled.svg'
import ProjectsFilledSVG from '@/svgs/projects-filled.svg'
import ProjectsOutlineSVG from '@/svgs/projects-outline.svg'
import AppsFilledSVG from '@/svgs/apps-filled.svg'
import AppsOutlineSVG from '@/svgs/apps-outline.svg'
import AboutFilledSVG from '@/svgs/about-filled.svg'
import AboutOutlineSVG from '@/svgs/about-outline.svg'
import ShareFilledSVG from '@/svgs/share-filled.svg'
import ShareOutlineSVG from '@/svgs/share-outline.svg'
import WebsiteFilledSVG from '@/svgs/website-filled.svg'
import WebsiteOutlineSVG from '@/svgs/website-outline.svg'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { cn } from '@/lib/utils'
import { useSize } from '@/hooks/use-size'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { HomeDraggableLayer } from '@/app/(home)/home-draggable-layer'
import { useSiteAssetUrl } from '@/hooks/use-site-assets'

const list = [
	{
		icon: ScrollOutlineSVG,
		iconActive: ScrollFilledSVG,
		label: '近期文章',
		href: '/blog'
	},
	{
		icon: AppsOutlineSVG,
		iconActive: AppsFilledSVG,
		label: '应用导航',
		href: '/apps'
	},
	{
		icon: ProjectsOutlineSVG,
		iconActive: ProjectsFilledSVG,
		label: '我的项目',
		href: '/projects'
	},
	{
		icon: AboutOutlineSVG,
		iconActive: AboutFilledSVG,
		label: '关于网站',
		href: '/about'
	},
	{
		icon: ShareOutlineSVG,
		iconActive: ShareFilledSVG,
		label: '推荐分享',
		href: '/share'
	},
	{
		icon: WebsiteOutlineSVG,
		iconActive: WebsiteFilledSVG,
		label: '优秀博客',
		href: '/bloggers'
	}
]

const FULL_HIGHLIGHT_HEIGHT = 28
const FULL_HIGHLIGHT_GAP = 8
const ICON_SLOT_SIZE = 44
const ICON_GAP_DESKTOP = 18
const ICON_GAP_MOBILE = 12
const ICON_CONTAINER_PADDING = 12
const APPS_ICON_SCALE = 1.5
const DEFAULT_ICON_SIZE_CLASS = 'h-7 w-7'
const AVATAR_URL = '/api/site-assets/avatar'

export default function NavCard() {
	const pathname = usePathname()
	const center = useCenterStore()
	const [show, setShow] = useState(false)
	const { maxSM, maxXS } = useSize()
	const [hoverIndex, setHoverIndex] = useState<number | null>(null)
	const previousFormRef = useRef<'full' | 'mini' | 'icons' | null>(null)
	const previousDisplayIndexRef = useRef<number | null>(null)
	const { siteContent, cardStyles } = useConfigStore()
	const avatarUrl = useSiteAssetUrl('avatar')
	const styles = cardStyles.navCard
	const hiCardStyles = cardStyles.hiCard

	const activeIndex = useMemo(() => {
		const index = list.findIndex(item => pathname === item.href)
		return index >= 0 ? index : 0
	}, [pathname])

	useEffect(() => {
		setShow(true)
	}, [])

	let form = useMemo(() => {
		if (pathname == '/') return 'full'
		else if (pathname == '/write') return 'mini'
		else return 'icons'
	}, [pathname])
	if (maxSM) form = 'icons'

	const displayIndex = hoverIndex ?? activeIndex
	const iconGap = maxSM ? ICON_GAP_MOBILE : ICON_GAP_DESKTOP
	const iconTrackWidth = list.length * ICON_SLOT_SIZE + (list.length - 1) * iconGap
	const iconHighlightLeft = displayIndex * (ICON_SLOT_SIZE + iconGap)
	const iconHighlightStyle = {
		left: iconHighlightLeft,
		top: 0,
		width: ICON_SLOT_SIZE,
		height: ICON_SLOT_SIZE
	}
	const fullHighlightStyle = {
		left: 0,
		top: displayIndex * (FULL_HIGHLIGHT_HEIGHT + FULL_HIGHLIGHT_GAP),
		width: '100%',
		height: FULL_HIGHLIGHT_HEIGHT
	} as const

	let position = useMemo(() => {
		if (form === 'full') {
			const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x - hiCardStyles.width / 2 - styles.width - CARD_SPACING
			const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y + hiCardStyles.height / 2 - styles.height
			return { x, y }
		}

		return {
			x: 24,
			y: 16
		}
	}, [form, center, styles, hiCardStyles])

	const size = useMemo(() => {
		if (form === 'mini') return { width: 64, height: 64 }
		if (form === 'icons') return { width: iconTrackWidth + ICON_CONTAINER_PADDING * 2 + 40 + 24, height: 64 }
		return { width: styles.width, height: Math.max(styles.height, 494) }
	}, [form, styles, iconTrackWidth])

	useEffect(() => {
		setHoverIndex(null)
	}, [pathname])

	const shouldAnimateIcons = useMemo(() => {
		const previousForm = previousFormRef.current
		const previousDisplayIndex = previousDisplayIndexRef.current
		const animate = previousForm === 'icons' && previousDisplayIndex !== null && previousDisplayIndex !== displayIndex
		return animate
	}, [displayIndex])

	useEffect(() => {
		previousFormRef.current = form
		previousDisplayIndexRef.current = displayIndex
	}, [form, displayIndex])

	if (maxSM) position = { x: center.x - size.width / 2, y: 16 }

	if (show)
		return (
			<HomeDraggableLayer cardKey='navCard' x={position.x} y={position.y} width={size.width} height={size.height}>
				<Card
					order={styles.order}
					width={size.width}
					height={size.height}
					x={position.x}
					y={position.y}
					enterScale={form === 'icons' ? 1 : 0.6}
					className={clsx(form === 'mini' && 'overflow-hidden p-3', form === 'icons' && 'overflow-visible flex items-center gap-3 px-3 py-2', form === 'full' && 'p-6')}>
					{form === 'full' && siteContent.enableChristmas && (
						<img
							src='/images/christmas/snow-4.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 160, left: -18, top: -20, opacity: 0.9 }}
						/>
					)}

					<Link className={cn('flex items-center gap-3', form === 'icons' && 'shrink-0')} href='/'>
						<img src={avatarUrl || AVATAR_URL} alt='avatar' width={40} height={40} style={{ boxShadow: '0 12px 20px -5px #E2D9CE' }} className='h-10 w-10 shrink-0 rounded-full object-cover' />
						{form === 'full' && <span className='font-averia mt-1 text-2xl leading-none font-medium'>{siteContent.meta.title}</span>}
						{form === 'full' && <span className='text-brand mt-2 text-xs font-medium'>(开发中)</span>}
					</Link>

					{(form === 'full' || form === 'icons') && (
						<>
							{form !== 'icons' && <div className='text-secondary mt-6 text-sm uppercase'>General</div>}

							<div
								className={cn('relative mt-2 space-y-2', form === 'icons' && 'mt-0')}
								onMouseLeave={() => setHoverIndex(null)}>
								{form === 'icons' ? (
									<div className='relative' style={{ width: iconTrackWidth, height: ICON_SLOT_SIZE }}>
										<motion.div
											className='pointer-events-none absolute rounded-full border'
											initial={false}
											animate={iconHighlightStyle}
											transition={shouldAnimateIcons ? { type: 'spring', stiffness: 380, damping: 32 } : { duration: 0 }}
											style={{ backgroundImage: 'linear-gradient(to right bottom, var(--color-border) 60%, var(--color-card) 100%)' }}
										/>

										<div className='absolute inset-0 flex items-center' style={{ gap: iconGap }}>
											{list.map((item, index) => {
												const isAppsItem = item.href === '/apps'
												const isCurrent = displayIndex === index
												const iconWrapperStyle = isAppsItem ? { transform: `scale(${APPS_ICON_SCALE})` } : undefined

												return (
													<Link
														key={item.href}
														href={item.href}
														className='relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full'
														onMouseEnter={() => setHoverIndex(index)}>
														<div className='flex h-7 w-7 shrink-0 items-center justify-center' style={iconWrapperStyle}>
															{isCurrent ? <item.iconActive className={cn('text-brand absolute', DEFAULT_ICON_SIZE_CLASS)} /> : <item.icon className={cn('absolute', DEFAULT_ICON_SIZE_CLASS)} />}
														</div>
													</Link>
												)
											})}
										</div>
									</div>
								) : (
									<>
										<div
											className='pointer-events-none absolute rounded-full border transition-all duration-200 ease-out'
											style={{
												...fullHighlightStyle,
												backgroundImage: 'linear-gradient(to right bottom, var(--color-border) 60%, var(--color-card) 100%)'
											}}
										/>

										{list.map((item, index) => {
											const isAppsItem = item.href === '/apps'
											const isCurrent = displayIndex === index
											const iconWrapperStyle = isAppsItem ? { transform: `scale(${APPS_ICON_SCALE})` } : undefined

											return (
												<Link
													key={item.href}
													href={item.href}
													className='text-secondary text-md relative z-10 flex items-center gap-3 rounded-full px-5 py-3'
													onMouseEnter={() => setHoverIndex(index)}>
													<div className='flex h-7 w-7 shrink-0 items-center justify-center' style={iconWrapperStyle}>
														{isCurrent ? <item.iconActive className={cn('text-brand absolute', DEFAULT_ICON_SIZE_CLASS)} /> : <item.icon className={cn('absolute', DEFAULT_ICON_SIZE_CLASS)} />}
													</div>
													<span className={clsx(isCurrent && 'text-primary font-medium')}>{item.label}</span>
												</Link>
											)
										})}
									</>
								)}
							</div>
						</>
					)}
				</Card>
			</HomeDraggableLayer>
		)
}
