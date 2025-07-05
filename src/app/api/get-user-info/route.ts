import { respData, respErr, respJson } from "@/lib/resp";

import { findUserByUuid, findUserByEmail } from "@/models/user";
import { getUserUuid } from "@/services/user";
import { getUserCredits } from "@/services/credit";
import { User } from "@/types/user";

export async function POST(req: Request) {
  try {
    let user_uuid = await getUserUuid();
    
    // 如果没有通过NextAuth获取到uuid，尝试从URL参数获取email
    if (!user_uuid) {
      const url = new URL(req.url);
      const email = url.searchParams.get('email');
      
      if (email) {
        const user = await findUserByEmail(email);
        if (user?.uuid) {
          user_uuid = user.uuid;
        }
      }
    }
    
    if (!user_uuid) {
      return respJson(-2, "no auth");
    }

    const dbUser = await findUserByUuid(user_uuid);
    if (!dbUser) {
      return respErr("user not exist");
    }

    const userCredits = await getUserCredits(user_uuid);

    const user = {
      ...(dbUser as unknown as User),
      credits: userCredits,
    };

    return respData(user);
  } catch (e) {
    console.log("get user info failed: ", e);
    return respErr("get user info failed");
  }
}
