'use client'

import Card from '@/components/card'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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

const extraSize = 5
const APPS_ICON_SCALE = 1.5
const DEFAULT_ICON_SIZE_CLASS = 'h-7 w-7'
const AVATAR_URL = '/api/site-assets/avatar'

export default function NavCard() {
	const pathname = usePathname()
	const center = useCenterStore()
	const [show, setShow] = useState(false)
	const { maxSM, maxXS } = useSize()
	const [hoveredIndex, setHoveredIndex] = useState<number>(0)
	const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties | null>(null)
	const [animateIconsHighlight, setAnimateIconsHighlight] = useState(false)
	const [highlightReady, setHighlightReady] = useState(false)
	const itemRefs = useRef<Array<HTMLAnchorElement | null>>([])
	const iconContainerRef = useRef<HTMLDivElement | null>(null)
	const previousFormRef = useRef<'full' | 'mini' | 'icons' | null>(null)
	const { siteContent, cardStyles } = useConfigStore()
	const avatarUrl = useSiteAssetUrl('avatar')
	const styles = cardStyles.navCard
	const hiCardStyles = cardStyles.hiCard

	const activeIndex = useMemo(() => {
		const index = list.findIndex(item => pathname === item.href)
		return index >= 0 ? index : undefined
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

	const itemHeight = form === 'full' ? 52 : 28

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
		else if (form === 'icons') return { width: maxSM ? (maxXS ? 356 : 392) : Math.max(408, 88 + list.length * 44 + (list.length - 1) * 18 + 24), height: 64 }
		else return { width: styles.width, height: Math.max(styles.height, 494) }
	}, [form, styles, maxSM, maxXS])

	useEffect(() => {
		setHoveredIndex(activeIndex ?? 0)
	}, [activeIndex])

	useEffect(() => {
		const previousForm = previousFormRef.current
		if (form !== 'icons') {
			setAnimateIconsHighlight(false)
			setHighlightReady(true)
			previousFormRef.current = form
			return
		}

		if (previousForm !== 'icons') {
			setAnimateIconsHighlight(false)
			setHighlightReady(false)
			const frame = window.requestAnimationFrame(() => {
				setHighlightReady(true)
			})
			previousFormRef.current = form
			return () => window.cancelAnimationFrame(frame)
		}

		setAnimateIconsHighlight(true)
		setHighlightReady(true)
		previousFormRef.current = form
	}, [form, pathname])


	useLayoutEffect(() => {
		if (form === 'icons') {
			if (!highlightReady) {
				setHighlightStyle(null)
				return
			}

			const activeItem = itemRefs.current[hoveredIndex]
			const container = iconContainerRef.current
			if (!activeItem || !container) {
				setHighlightStyle(null)
				return
			}

			const itemRect = activeItem.getBoundingClientRect()
			const containerRect = container.getBoundingClientRect()
			setHighlightStyle({
				left: itemRect.left - containerRect.left - extraSize,
				top: itemRect.top - containerRect.top - extraSize,
				width: itemRect.width + extraSize * 2,
				height: itemRect.height + extraSize * 2
			})
			return
		}

		setHighlightStyle({
			left: 0,
			top: hoveredIndex * (itemHeight + 8),
			width: '100%',
			height: itemHeight
		})
	}, [form, hoveredIndex, itemHeight, maxSM, maxXS, pathname, size.width, highlightReady])


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
					className={clsx(form === 'mini' && 'overflow-hidden p-3', form === 'icons' && 'overflow-visible flex items-center gap-2 px-4 py-2 sm:gap-4', form === 'full' && 'p-6')}>
					{form === 'full' && siteContent.enableChristmas && (
						<>
							<img
								src='/images/christmas/snow-4.webp'
								alt='Christmas decoration'
								className='pointer-events-none absolute'
								style={{ width: 160, left: -18, top: -20, opacity: 0.9 }}
							/>
						</>
					)}

					<Link className={cn('flex items-center gap-3', form === 'icons' && 'shrink-0')} href='/'>
						<img src={avatarUrl || AVATAR_URL} alt='avatar' width={40} height={40} style={{ boxShadow: ' 0 12px 20px -5px #E2D9CE' }} className='h-10 w-10 shrink-0 rounded-full object-cover' />
						{form === 'full' && <span className='font-averia mt-1 text-2xl leading-none font-medium'>{siteContent.meta.title}</span>}
						{form === 'full' && <span className='text-brand mt-2 text-xs font-medium'>(开发中)</span>}
					</Link>

					{(form === 'full' || form === 'icons') && (
						<>
							{form !== 'icons' && <div className='text-secondary mt-6 text-sm uppercase'>General</div>}

							<div
								ref={iconContainerRef}
								className={cn('relative mt-2 space-y-2', form === 'icons' && 'mt-0 flex min-w-0 flex-1 items-center justify-between gap-2 space-y-0 overflow-visible sm:gap-4')}
								onMouseLeave={() => {
									if (form === 'icons') setHoveredIndex(activeIndex ?? 0)
								}}>
								{highlightStyle &&
									highlightReady &&
									(form === 'icons' ? (
										<motion.div
											className='pointer-events-none absolute max-w-[230px] rounded-full border'
											initial={false}
											animate={highlightStyle}
											transition={animateIconsHighlight ? { type: 'spring', stiffness: 380, damping: 32 } : { duration: 0 }}
											style={{ backgroundImage: 'linear-gradient(to right bottom, var(--color-border) 60%, var(--color-card) 100%)' }}
										/>
									) : (
										<div
											className='pointer-events-none absolute rounded-full border transition-all duration-200 ease-out'
											style={{
												...highlightStyle,
												backgroundImage: 'linear-gradient(to right bottom, var(--color-border) 60%, var(--color-card) 100%)'
											}}
										/>
									))}

								{list.map((item, index) => {
									const isAppsItem = item.href === '/apps'
									const iconSizeClass = DEFAULT_ICON_SIZE_CLASS
									const iconWrapperStyle = isAppsItem ? { transform: `scale(${APPS_ICON_SCALE})` } : undefined

									return (
										<Link
											ref={element => {
												itemRefs.current[index] = element
											}}
											key={item.href}
											href={item.href}
											className={cn(
												'text-secondary text-md relative z-10 flex items-center gap-3 rounded-full px-5 py-3',
												form === 'icons' && 'flex h-11 w-11 shrink-0 items-center justify-center p-0'
											)}
											onMouseEnter={() => setHoveredIndex(index)}>
											<div className='flex h-7 w-7 shrink-0 items-center justify-center' style={iconWrapperStyle}>
												{hoveredIndex == index ? <item.iconActive className={cn('text-brand absolute', iconSizeClass)} /> : <item.icon className={cn('absolute', iconSizeClass)} />}
											</div>
											{form !== 'icons' && <span className={clsx(index == hoveredIndex && 'text-primary font-medium')}>{item.label}</span>}
										</Link>
									)
								})}
							</div>
						</>
					)}
				</Card>
			</HomeDraggableLayer>
		)
}
