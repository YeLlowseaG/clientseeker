"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { useLocale } from 'next-intl';

export default function BindEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isChineseLocale = locale === 'zh';
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [wechatUserData, setWechatUserData] = useState<any>(null);

  useEffect(() => {
    // 从URL参数或localStorage获取微信用户数据
    const tempUserData = localStorage.getItem('temp_wechat_user');
    if (tempUserData) {
      try {
        setWechatUserData(JSON.parse(tempUserData));
      } catch (error) {
        console.error('Failed to parse WeChat user data:', error);
        router.push('/');
      }
    } else {
      // 没有临时数据，重定向到首页
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !wechatUserData) return;

    setIsLoading(true);
    setError('');

    try {
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error(isChineseLocale ? '请输入有效的邮箱地址' : 'Please enter a valid email address');
      }

      // 检查邮箱是否已存在
      const checkResponse = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
      const checkData = await checkResponse.json();

      if (checkData.exists) {
        // 邮箱已存在，询问是否要关联账户
        const confirmLink = confirm(
          isChineseLocale 
            ? `邮箱 ${email} 已被使用。是否要将微信账户关联到此邮箱？这将合并您的账户数据。`
            : `Email ${email} is already in use. Would you like to link your WeChat account to this email? This will merge your account data.`
        );

        if (!confirmLink) {
          setError(isChineseLocale ? '请使用其他邮箱地址' : 'Please use a different email address');
          setIsLoading(false);
          return;
        }

        // 执行账户关联
        await linkAccounts(email, checkData.userId);
      } else {
        // 邮箱不存在，更新微信用户的邮箱
        await updateWeChatUserEmail(email);
      }

    } catch (error: any) {
      console.error('Email binding error:', error);
      setError(error.message || (isChineseLocale ? '绑定失败，请重试' : 'Binding failed, please try again'));
    } finally {
      setIsLoading(false);
    }
  };

  const linkAccounts = async (email: string, existingUserId: string) => {
    const response = await fetch('/api/link-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        wechatData: wechatUserData,
        existingUserId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const { user } = await response.json();
    completeBinding(user);
  };

  const updateWeChatUserEmail = async (email: string) => {
    const updatedUserData = {
      openid: wechatUserData.openid,
      nickname: wechatUserData.nickname,
      headimgurl: wechatUserData.headimgurl,
      sex: wechatUserData.sex,
      province: wechatUserData.province,
      city: wechatUserData.city,
      country: wechatUserData.country,
      // 映射到现有用户结构
      uuid: wechatUserData.openid,
      avatar_url: wechatUserData.headimgurl,
      email: email,
      created_at: new Date().toISOString(),
    };

    const response = await fetch('/api/save-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUserData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const { user } = await response.json();
    completeBinding(user);
  };

  const completeBinding = (user: any) => {
    // 保存用户信息
    localStorage.setItem('user_info', JSON.stringify(user));
    // 清理临时数据
    localStorage.removeItem('temp_wechat_user');
    
    // 跳转到搜索页面
    router.push('/search');
  };

  if (!wechatUserData) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{isChineseLocale ? '加载中...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <img 
            src={wechatUserData.headimgurl} 
            alt="头像" 
            className="w-16 h-16 rounded-full mx-auto mb-4"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <CardTitle>
            {isChineseLocale ? '绑定邮箱' : 'Bind Email'}
          </CardTitle>
          <CardDescription>
            {isChineseLocale 
              ? `欢迎，${wechatUserData.nickname}！请绑定邮箱以完成注册。`
              : `Welcome, ${wechatUserData.nickname}! Please bind an email to complete registration.`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">
                {isChineseLocale ? '邮箱地址' : 'Email Address'}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isChineseLocale ? '请输入您的邮箱' : 'Enter your email'}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading 
                ? (isChineseLocale ? '绑定中...' : 'Binding...') 
                : (isChineseLocale ? '绑定邮箱' : 'Bind Email')
              }
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              onClick={() => {
                localStorage.removeItem('temp_wechat_user');
                router.push('/');
              }}
            >
              {isChineseLocale ? '取消' : 'Cancel'}
            </Button>
          </div>

          <div className="mt-6 text-xs text-muted-foreground text-center space-y-2">
            <p>
              {isChineseLocale 
                ? '📧 绑定邮箱后，您可以：'
                : '📧 After binding email, you can:'
              }
            </p>
            <ul className="space-y-1">
              <li>
                {isChineseLocale 
                  ? '• 使用微信或Google任一方式登录'
                  : '• Login with either WeChat or Google'
                }
              </li>
              <li>
                {isChineseLocale 
                  ? '• 同步所有账户数据和订阅'
                  : '• Sync all account data and subscriptions'
                }
              </li>
              <li>
                {isChineseLocale 
                  ? '• 接收重要通知和更新'
                  : '• Receive important notifications and updates'
                }
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}