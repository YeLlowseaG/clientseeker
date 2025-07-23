import {
  findUserByInviteCode,
  findUserByUuid,
  findUserByEmail,
  updateUserInviteCode,
} from "@/models/user";
import { respData, respErr } from "@/lib/resp";

export async function POST(req: Request) {
  try {
    const { invite_code, email } = await req.json();
    if (!invite_code || !email) {
      return respErr("invalid params");
    }

    if (invite_code.length < 2 || invite_code.length > 16) {
      return respErr("invalid invite code, length must be between 2 and 16");
    }

    // 通过邮箱查找用户
    const user_info = await findUserByEmail(email);
    if (!user_info || !user_info.email) {
      return respErr("invalid user");
    }

    const user_uuid = user_info.uuid;

    if (user_info.invite_code === invite_code) {
      return respData(user_info);
    }

    const user_by_invite_code = await findUserByInviteCode(invite_code);
    if (user_by_invite_code) {
      if (user_by_invite_code.uuid !== user_uuid) {
        return respErr("invite code already exists");
      }

      return respData(user_by_invite_code);
    }

    await updateUserInviteCode(user_uuid, invite_code);

    user_info.invite_code = invite_code;

    return respData(user_info);
  } catch (e) {
    console.log("update invite code failed", e);
    return respErr("update invite code failed");
  }
}
