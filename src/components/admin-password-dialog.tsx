'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useAuthStore } from '@/hooks/use-auth'

export function AdminPasswordDialog() {
	const { isAuth, login, logout } = useAuthStore()
	const [open, setOpen] = useState(false)
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)

	const handleLogin = async () => {
		try {
			setLoading(true)
			await login(password)
			toast.success('登录成功')
			setPassword('')
			setOpen(false)
		} catch (error: any) {
			toast.error(error?.message || '登录失败')
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
				管理员登录
			</motion.button>
			{open && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4'>
					<div className='w-full max-w-sm rounded-2xl border bg-white p-5 shadow-xl'>
						<div className='mb-3 text-lg font-semibold'>输入管理密码</div>
						<input
							type='password'
							value={password}
							onChange={e => setPassword(e.target.value)}
							onKeyDown={e => {
								if (e.key === 'Enter') handleLogin()
							}}
							className='w-full rounded-xl border px-3 py-2 text-sm'
							placeholder='请输入密码'
						/>
						<div className='mt-4 flex justify-end gap-2'>
							<button className='rounded-xl border px-4 py-2 text-sm' onClick={() => setOpen(false)}>
								取消
							</button>
							<button className='brand-btn px-4' disabled={loading} onClick={handleLogin}>
								{loading ? '登录中...' : '登录'}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
