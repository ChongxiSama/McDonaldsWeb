"use client";

import ActBtn from "@/components/ui/actBtn";

type LoginLandingProps = {
  onSgwLogin: () => void;
  onAccountLogin: () => void;
  onRegister?: () => void;
};

export default function LoginLanding({ onSgwLogin, onAccountLogin, onRegister }: LoginLandingProps) {
  return (
    <>
      <ActBtn variant="primary" onClick={onSgwLogin}>
        SGWCMAID 登录
      </ActBtn>
      <ActBtn variant="secondary" onClick={onAccountLogin}>
        账号密码登录
      </ActBtn>
      {onRegister && <ActBtn variant="secondary" onClick={onRegister}>注册新账号</ActBtn>}
      <p className="mai-legal">
        登录即代表您同意 <a href="#">《转发服务用户协议》</a> 以及 <a href="#">《转发服务隐私保护协议》</a>
      </p>
    </>
  );
}
