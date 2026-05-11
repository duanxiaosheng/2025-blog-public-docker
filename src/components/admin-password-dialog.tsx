'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useAuthStore } from '@/hooks/use-auth'

export function AdminPasswordDialog() {
	const { isAuth, isInitialized, usesEnvPassword, login, logout, initialize, refreshAuthState } = useAuthStore()
	const [open, setOpen] = useState(false)
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [showResetHelp, setShowResetHelp] = useState(false)

	useEffect(() => {
		refreshAuthState().catch(() => {})
	}, [refreshAuthState])

	const handleLogin = async () => {
		try {
			setLoading(true)
			await login(password)
			toast.success('登录成功')
			setPassword('')
			setOpen(false)
			setShowResetHelp(false)
		} catch (error: any) {
			toast.error(error?.message || '登录失败')
		} finally {
			setLoading(false)
		}
	}

	const handleInitialize = async () => {
		try {
			setLoading(true)
			await initialize(password, confirmPassword)
			toast.success('管理员密码初始化成功')
			setPassword('')
			setConfirmPassword('')
			setOpen(false)
			setShowResetHelp(false)
		} catch (error: any) {
			toast.error(error?.message || '初始化失败')
		} finally {
			setLoading(false)
		}
	}

	const handleLogout = async () => {
		await logout()
		toast.success('已退出登录')
	}

	if (isAuth) {
		return (
			<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout} className='rounded-xl border bg-white/60 px-4 py-2 text-sm'>
				退出登录
			</motion.button>
		)
	}

	return (
		<>
			<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setOpen(true)} className='rounded-xl border bg-white/60 px-4 py-2 text-sm'>
				{isInitialized ? '管理员登录' : '初始化管理员密码'}
			</motion.button>
			{open && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4'>
					<div className='w-full max-w-sm rounded-2xl border bg-white p-5 shadow-xl'>
						<div className='mb-2 text-lg font-semibold'>{isInitialized ? '输入管理密码' : '首次使用，请先设置管理员密码'}</div>
						{!isInitialized && !usesEnvPassword && <div className='text-secondary mb-3 text-sm'>设置完成后将直接登录，并保存到本地数据目录。</div>}
						<input
							type='password'
							value={password}
							onChange={e => setPassword(e.target.value)}
							onKeyDown={e => {
								if (e.key === 'Enter' && isInitialized) handleLogin()
							}}
							className='w-full rounded-xl border px-3 py-2 text-sm'
							placeholder={isInitialized ? '请输入密码' : '请输入新密码（至少 6 位）'}
						/>
						{!isInitialized && (
							<input
								type='password'
								value={confirmPassword}
								onChange={e => setConfirmPassword(e.target.value)}
								onKeyDown={e => {
									if (e.key === 'Enter') handleInitialize()
								}}
								className='mt-3 w-full rounded-xl border px-3 py-2 text-sm'
								placeholder='请再次输入密码'
							/>
						)}
						{isInitialized && (
							<div className='mt-3 text-right'>
								<button type='button' className='text-secondary text-xs underline underline-offset-2 hover:text-black' onClick={() => setShowResetHelp(prev => !prev)}>
									忘记密码？
								</button>
							</div>
						)}
						{showResetHelp && isInitialized && (
							<div className='bg-secondary/10 mt-4 rounded-xl border p-3 text-xs leading-6'>
								<div className='mb-2 font-medium'>忘记管理员密码怎么办？</div>
								{usesEnvPassword ? (
									<>
										<div className='text-secondary'>当前密码由 <code>.env</code> 文件中的 <code>ADMIN_PASSWORD</code> 控制。请修改它后重启 Docker。</div>
									</>
								) : (
									<>
										<div className='text-secondary'>必须：</div>
										<div className='text-secondary mt-1'>1、请登录服务器删掉服务器此项目目录的 <code>data/config/admin-auth.json</code> 文件。</div>
										<div className='text-secondary mt-1'>2、重启 Docker 后，重新打开网站，即可再次进入“初始化管理员密码”流程。</div>
									</>
								)}
							</div>
						)}
						<div className='mt-4 flex justify-end gap-2'>
							<button className='rounded-xl border px-4 py-2 text-sm' onClick={() => { setOpen(false); setShowResetHelp(false) }}>
								取消
							</button>
							<button className='brand-btn px-4' disabled={loading} onClick={isInitialized ? handleLogin : handleInitialize}>
								{loading ? (isInitialized ? '登录中...' : '初始化中...') : isInitialized ? '登录' : '初始化'}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
