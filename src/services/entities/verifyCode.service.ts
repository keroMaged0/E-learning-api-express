import { NotAllowedError } from "../../errors/notAllowedError";
import { NotFoundError } from "../../errors/notFoundError";
import { generateAccessToken } from "../../utils/token";
import { mailTransporter } from "../../utils/mail";
import { generateCode } from "../../utils/random";
import { SystemRoles } from "../../types/roles";
import { hashCode } from "../../utils/crypto";


/*************** Check Verify Code Expire ***************/
const isExpired = (date: Date) => {
    const currentTime = Date.now();
    const expireTime = date.getTime();
    return currentTime > expireTime;
}

/*************** Check Verify Code is valid ***************/
const checkVerifyCode = ({ user, code, next }) => {
    if (!user.verificationCode.reason) return next(new NotFoundError('no response to verification code'));
    if (user.verificationCode.code !== hashCode(code)) return next(new NotAllowedError('invalid verification code'));

    if (isExpired(new Date(user.verificationCode.expireAt || 0))) return next(new NotAllowedError('expired verification code'));
}

/*************** Sign Up reason verify code ***************/
const signUpReason = (user) => {
    if (user.role === SystemRoles.admin) user.role = SystemRoles.student;

    const token = generateAccessToken();
    user.verificationCode.code = null;
    user.verificationCode.expireAt = null;
    user.verificationCode.reason = null;
    user.isVerified = true;
    user.token = token;

    return {
        token: {
            access: token,
        },
    };
}

/*************** Send Verify Code ***************/
const sendVerifyCode = async ({ user, reason, subject }) => {
    const code = generateCode();

    user.verificationCode = {
        code: hashCode(code),
        expireAt: new Date(Date.now() + 10 * 60 * 1000),
        reason,
        tempEmail: user.verificationCode.tempEmail,
    };

    await user.save();

    await mailTransporter.sendMail({
        to: user.email,
        subject,
        html: `verification code <bold>${code}</bold>`,
    });

    return {
        expireAt: new Date(Date.now() + 10 * 60 * 1000),
    };
}

/*************** Check verify Code ***************/
const clearVerifyCode = async (user: any) => {
    user.verificationCode.code = null;
    user.verificationCode.expireAt = null;
    user.verificationCode.reason = null;
    await user.save();
}




export {
    isExpired,
    checkVerifyCode,
    sendVerifyCode,
    clearVerifyCode,
    signUpReason,

}