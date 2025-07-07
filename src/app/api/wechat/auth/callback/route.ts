import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    console.log('WeChat OAuth callback:', { code: !!code, state });

    if (!code) {
      console.error('No authorization code received');
      return new NextResponse(`
        <html>
          <body>
            <script>
              window.opener?.postMessage({ type: 'WECHAT_LOGIN_ERROR', error: 'No authorization code' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // 验证state参数（可选，增加安全性）
    // 这里可以添加state验证逻辑

    // 使用code换取access_token
    const tokenResponse = await fetch('https://api.weixin.qq.com/sns/oauth2/access_token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 构建查询参数
    }).then(res => res.text()).catch(() => null);

    // 直接构建URL进行请求
    const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?` +
      `appid=${process.env.WECHAT_APP_ID}&` +
      `secret=${process.env.WECHAT_APP_SECRET}&` +
      `code=${code}&` +
      `grant_type=authorization_code`;

    console.log('Requesting WeChat access token...');

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    console.log('WeChat token response:', { 
      success: !!tokenData.access_token, 
      error: tokenData.errcode 
    });

    if (tokenData.errcode) {
      console.error('WeChat token error:', tokenData);
      return new NextResponse(`
        <html>
          <body>
            <script>
              window.opener?.postMessage({ 
                type: 'WECHAT_LOGIN_ERROR', 
                error: 'Failed to get access token: ${tokenData.errmsg}' 
              }, '*');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const { access_token, openid } = tokenData;

    // 使用access_token获取用户信息
    const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?` +
      `access_token=${access_token}&` +
      `openid=${openid}`;

    console.log('Requesting WeChat user info...');

    const userInfoRes = await fetch(userInfoUrl);
    const userInfoData = await userInfoRes.json();

    console.log('WeChat user info response:', { 
      success: !!userInfoData.openid, 
      error: userInfoData.errcode 
    });

    if (userInfoData.errcode) {
      console.error('WeChat user info error:', userInfoData);
      return new NextResponse(`
        <html>
          <body>
            <script>
              window.opener?.postMessage({ 
                type: 'WECHAT_LOGIN_ERROR', 
                error: 'Failed to get user info: ${userInfoData.errmsg}' 
              }, '*');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // 构建用户信息
    const userInfo = {
      openid: userInfoData.openid,
      nickname: userInfoData.nickname,
      headimgurl: userInfoData.headimgurl,
      sex: userInfoData.sex,
      province: userInfoData.province,
      city: userInfoData.city,
      country: userInfoData.country,
      // 为了兼容现有系统，生成一个基于openid的邮箱
      email: `${userInfoData.openid}@wechat.user`,
      // 映射到现有用户结构
      uuid: userInfoData.openid,
      avatar_url: userInfoData.headimgurl,
      created_at: new Date().toISOString(),
    };

    console.log('WeChat login successful for user:', userInfo.nickname);

    // 检查是否已存在同openid的用户
    try {
      const checkResponse = await fetch(`${process.env.NEXT_PUBLIC_WEB_URL}/api/check-email?email=${encodeURIComponent(userInfo.email)}`);
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        
        if (checkData.exists) {
          // 用户已存在，直接登录
          console.log('WeChat user already exists, proceeding with login');
          
          // 获取完整用户信息
          const getUserResponse = await fetch(`${process.env.NEXT_PUBLIC_WEB_URL}/api/get-user-info?email=${encodeURIComponent(userInfo.email)}`, {
            method: 'POST',
          });
          
          if (getUserResponse.ok) {
            const { data: existingUser } = await getUserResponse.json();
            Object.assign(userInfo, existingUser);
          }
        } else {
          // 新用户，需要邮箱绑定
          console.log('New WeChat user, redirecting to email binding');
          
          // 将用户数据存储到临时存储中
          const tempUserData = {
            openid: userInfoData.openid,
            nickname: userInfoData.nickname,
            headimgurl: userInfoData.headimgurl,
            sex: userInfoData.sex,
            province: userInfoData.province,
            city: userInfoData.city,
            country: userInfoData.country,
          };
          
          // 返回重定向到邮箱绑定页面
          return new NextResponse(`
            <html>
              <head>
                <title>微信登录 - 邮箱绑定</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    background: #f5f5f5;
                  }
                  .redirect-container {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    text-align: center;
                    max-width: 400px;
                  }
                  .loading {
                    font-size: 14px;
                    color: #1890ff;
                    margin-top: 20px;
                  }
                </style>
              </head>
              <body>
                <div class="redirect-container">
                  <div>🔗</div>
                  <h2>完成注册</h2>
                  <p>请绑定邮箱以完成注册</p>
                  <div class="loading">正在跳转...</div>
                </div>
                
                <script>
                  // 存储临时用户数据
                  localStorage.setItem('temp_wechat_user', '${JSON.stringify(tempUserData)}');
                  
                  // 通知父窗口重定向到邮箱绑定页面
                  if (window.opener) {
                    window.opener.postMessage({
                      type: 'WECHAT_BIND_EMAIL_REQUIRED',
                      redirectUrl: '/auth/bind-email'
                    }, '*');
                  }
                  
                  // 2秒后关闭窗口
                  setTimeout(() => {
                    window.close();
                  }, 2000);
                </script>
              </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' },
          });
        }
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
      // 出错时继续原有流程
    }

    // 返回成功页面，通过postMessage传递用户信息
    return new NextResponse(`
      <html>
        <head>
          <title>微信登录成功</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .success-container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
            }
            .avatar {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              margin: 0 auto 20px;
              display: block;
            }
            .success-icon {
              color: #52c41a;
              font-size: 48px;
              margin-bottom: 16px;
            }
            .username {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 8px;
              color: #262626;
            }
            .message {
              color: #8c8c8c;
              margin-bottom: 24px;
            }
            .loading {
              font-size: 14px;
              color: #1890ff;
            }
          </style>
        </head>
        <body>
          <div class="success-container">
            <div class="success-icon">✅</div>
            <img src="${userInfo.headimgurl}" alt="头像" class="avatar" onerror="this.style.display='none'">
            <div class="username">${userInfo.nickname}</div>
            <div class="message">微信登录成功！</div>
            <div class="loading">正在跳转...</div>
          </div>
          
          <script>
            // 通过postMessage向父窗口传递登录成功信息
            if (window.opener) {
              window.opener.postMessage({
                type: 'WECHAT_LOGIN_SUCCESS',
                userInfo: ${JSON.stringify(userInfo)}
              }, '*');
            }
            
            // 同时设置localStorage作为备用方案
            localStorage.setItem('wechat_login_success', 'true');
            localStorage.setItem('wechat_user_info', '${JSON.stringify(userInfo)}');
            
            // 2秒后关闭窗口
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error: any) {
    console.error('WeChat OAuth callback error:', error);
    
    return new NextResponse(`
      <html>
        <body>
          <script>
            window.opener?.postMessage({ 
              type: 'WECHAT_LOGIN_ERROR', 
              error: '登录处理失败，请重试' 
            }, '*');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}