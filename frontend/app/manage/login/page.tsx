'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // ログイン画面またはコールバック画面にいるときはリダイレクト処理を行わない
    if (pathname === '/manage/login' || pathname === '/manage/callback') {
      return;
    }

    const token = localStorage.getItem('token'); // またはクッキー取得処理
    if (!token) {
      router.push('/manage/login');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
