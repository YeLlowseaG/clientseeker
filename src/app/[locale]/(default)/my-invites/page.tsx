"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Invite from "@/components/invite";
import TableBlock from "@/components/blocks/table";
import { TableColumn } from "@/types/blocks/table";
import { Table as TableSlotType } from "@/types/slots/table";
import moment from "moment";

export default function MyInvitesPage() {
  const { user, isUserLoading } = useAppContext();
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [affiliates, setAffiliates] = useState([]);
  const [summary, setSummary] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isUserLoading) return;
    
    if (user && user.email) {
      fetchInviteData();
    } else {
      setLoading(false);
    }
  }, [user, isUserLoading]);

  const fetchInviteData = async () => {
    try {
      setLoading(true);
      
      // 获取邀请数据
      const response = await fetch('/api/get-invite-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0 && result.data) {
          setAffiliates(result.data.affiliates || []);
          setSummary(result.data.summary || {});
          setCurrentUser(result.data.user || null);
          
          // 如果用户没有邀请码，自动生成一个，然后重新获取数据
          if (result.data.user && !result.data.user.invite_code) {
            await autoGenerateInviteCode();
            // 重新获取数据以显示新的邀请码
            await fetchInviteDataAgain();
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch invite data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInviteDataAgain = async () => {
    try {
      const response = await fetch('/api/get-invite-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0 && result.data) {
          setCurrentUser(result.data.user || null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch invite data again:', error);
    }
  };

  const autoGenerateInviteCode = async () => {
    try {
      // 生成基于用户邮箱的短码（取邮箱@前的部分 + 随机4位数字）
      const emailPrefix = user?.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const autoCode = `${emailPrefix}${randomSuffix}`.substring(0, 12); // 限制长度
      
      const response = await fetch('/api/update-invite-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invite_code: autoCode,
          email: user?.email
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0) {
          console.log('Auto-generated invite code:', autoCode);
        }
      }
    } catch (error) {
      console.error('Failed to auto-generate invite code:', error);
    }
  };

  // 如果还在加载用户信息，显示加载状态
  if (isUserLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // 如果未登录，显示提示
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">请先登录</h1>
        <p className="text-gray-600 mb-4">您需要登录才能查看邀请记录</p>
        <Button onClick={() => window.location.href = "/"}>
          返回首页
        </Button>
      </div>
    );
  }

  const columns: TableColumn[] = [
    {
      name: "created_at",
      title: t("my_invites.table.invite_time"),
      callback: (item) => moment(item.created_at).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      name: "user",
      title: t("my_invites.table.invite_user"),
      callback: (item) => (
        <div className="flex items-center gap-2">
          {item?.user?.avatar_url && (
            <img
              src={item.user?.avatar_url || ""}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span>{item.user?.nickname}</span>
        </div>
      ),
    },
    {
      name: "status",
      title: t("my_invites.table.status"),
      callback: (item) =>
        item.status === "pending"
          ? t("my_invites.table.pending")
          : t("my_invites.table.completed"),
    },
    {
      name: "reward_amount",
      title: t("my_invites.table.reward_amount"),
      callback: (item) => `${item.reward_amount}次搜索`,
    },
  ];

  const table: TableSlotType = {
    title: t("my_invites.title"),
    description: t("my_invites.description"),
    tip: {
      description: t("my_invites.my_invite_link"),
    },
    toolbar: {
      items: [
        {
          title: t("my_invites.edit_invite_link"),
          icon: "RiBookLine",
          url: "https://docs.shipany.ai",
          target: "_blank",
          variant: "outline",
        },
        {
          title: t("my_invites.copy_invite_link"),
          icon: "RiCopy2Line",
          url: "https://discord.gg/HQNnrzjZQS",
          target: "_blank",
        },
      ],
    },
    columns: columns,
    data: affiliates,
    empty_message: t("my_invites.no_invites"),
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        <Invite summary={summary} currentUser={currentUser} />
        <TableBlock {...table} />
      </div>
    </div>
  );
}