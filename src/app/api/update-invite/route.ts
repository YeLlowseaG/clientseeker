import {
  AffiliateRewardAmount,
  AffiliateRewardPercent,
  AffiliateStatus,
} from "@/services/constant";
import {
  findUserByInviteCode,
  findUserByUuid,
  updateUserInvitedBy,
} from "@/models/user";
import { respData, respErr } from "@/lib/resp";

import { getIsoTimestr } from "@/lib/time";
import { insertAffiliate } from "@/models/affiliate";

export async function POST(req: Request) {
  try {
    const { invite_code, user_uuid } = await req.json();
    if (!invite_code || !user_uuid) {
      return respErr("invalid params");
    }

    // check invite user
    const inviteUser = await findUserByInviteCode(invite_code);
    if (!inviteUser) {
      return respErr("invite user not found");
    }

    // check current user
    const user = await findUserByUuid(user_uuid);
    if (!user) {
      return respErr("user not found");
    }

    if (user.uuid === inviteUser.uuid || user.email === inviteUser.email) {
      return respErr("can't invite yourself");
    }

    if (user.invited_by) {
      return respErr("user already has invite user");
    }

    user.invited_by = inviteUser.uuid;

    // update invite user uuid
    await updateUserInvitedBy(user_uuid, inviteUser.uuid);

    await insertAffiliate({
      user_uuid: user_uuid,
      invited_by: inviteUser.uuid,
      created_at: new Date(),
      status: AffiliateStatus.Completed, // 注册即完成，发放搜索次数
      paid_order_no: "",
      paid_amount: 0,
      reward_percent: AffiliateRewardPercent.Invited,
      reward_amount: AffiliateRewardAmount.Invited,
    });

    // 发放注册奖励搜索次数
    if (AffiliateRewardAmount.Invited > 0) {
      const { insertCredit } = await import("@/models/credit");
      
      // 给邀请人奖励搜索次数
      await insertCredit({
        user_uuid: inviteUser.uuid,
        trans_no: `INVITE_${Date.now()}_${inviteUser.uuid}`,
        trans_type: "邀请注册奖励",
        credits: AffiliateRewardAmount.Invited,
        expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后过期
        created_at: new Date(),
      });

      // 给被邀请人也奖励搜索次数
      await insertCredit({
        user_uuid: user_uuid,
        trans_no: `INVITED_${Date.now()}_${user_uuid}`,
        trans_type: "注册奖励",
        credits: AffiliateRewardAmount.Invited,
        expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后过期
        created_at: new Date(),
      });
    }

    return respData(user);
  } catch (e) {
    console.error("update invited by failed: ", e);
    return respErr("update invited by failed");
  }
}
