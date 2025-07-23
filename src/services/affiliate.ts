import { findAffiliateByOrderNo, insertAffiliate } from "@/models/affiliate";

import { AffiliateRewardAmount } from "./constant";
import { AffiliateRewardPercent } from "./constant";
import { AffiliateStatus } from "./constant";
import { Order } from "@/types/order";
import { findUserByUuid } from "@/models/user";
import { getIsoTimestr } from "@/lib/time";

export async function updateAffiliateForOrder(order: Order) {
  try {
    const user = await findUserByUuid(order.user_uuid);
    if (user && user.uuid && user.invited_by && user.invited_by !== user.uuid) {
      const affiliate = await findAffiliateByOrderNo(order.order_no);
      if (affiliate) {
        return;
      }

      await insertAffiliate({
        user_uuid: user.uuid,
        invited_by: user.invited_by,
        created_at: new Date(),
        status: AffiliateStatus.Completed,
        paid_order_no: order.order_no,
        paid_amount: order.amount,
        reward_percent: AffiliateRewardPercent.Paied,
        reward_amount: AffiliateRewardAmount.Paied,
      });

      // 发放付费奖励搜索次数
      const { insertCredit } = await import("@/models/credit");
      await insertCredit({
        user_uuid: user.invited_by,
        trans_no: `PAID_REWARD_${Date.now()}_${order.order_no}`,
        trans_type: "邀请付费奖励",
        credits: AffiliateRewardAmount.Paied,
        expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后过期
        created_at: new Date(),
        order_no: order.order_no,
      });
    }
  } catch (e) {
    console.log("update affiliate for order failed: ", e);
    throw e;
  }
}
