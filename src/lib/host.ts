import { prisma } from "./prisma"
import { sessionCache } from "./cache"
import JSEncrypt from 'jsencrypt';
import CryptoJS from 'crypto-js';

function rsaEncrypt(data: string, publicKey: string) {
    if (!data) {
        return data;
    }
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(publicKey);
    return jsEncrypt.encrypt(data);
}

function aesEncrypt(data: string, key: string) {
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(data, keyBytes, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.toString();
}

function urlDecode(value: string): string {
    return decodeURIComponent(value.replace(/\+/g, ' '));
}

function generateAESKey(): string {
    const keyLength = 16;
    const randomBytes = new Uint8Array(keyLength);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

function encryptPassword(password: string, rsaPublicKeyText: string){
    if (!password) {
        return '';
    }
    if (!rsaPublicKeyText) {
        console.log('RSA public key not found');
        return password;
    }
    rsaPublicKeyText = urlDecode(rsaPublicKeyText);

    const aesKey = generateAESKey();
    rsaPublicKeyText = rsaPublicKeyText.replaceAll('"', '');
    const rsaPublicKey = atob(rsaPublicKeyText);
    const keyCipher = rsaEncrypt(aesKey, rsaPublicKey);
    const passwordCipher = aesEncrypt(password, aesKey);
    return `${keyCipher}:${passwordCipher}`;
}
interface LoginResponse {
  code: number
  message?: string
}

export async function getHostSessionId(hostId: string, useCache = true): Promise<string> {
  // 检查缓存
  if (useCache) {
    const cachedSessionId = sessionCache.get(hostId)
    if (cachedSessionId) {
      return cachedSessionId
    }
  }

  // 获取主机信息
  const host = await prisma.host.findUnique({
    where: { id: hostId }
  })

  if (!host) {
    throw new Error("主机不存在")
  }

  // 构建登录地址
  const loginUrl = `${host.url}/api/v1/auth/login`

  let hostPassword = host.password;
  if (host.publicKey) {
    hostPassword = encryptPassword(host.password!, host.publicKey!); 
  }
  // 发送登录请求
  const loginResponse = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Entrancecode": Buffer.from(host.entranceCode).toString("base64"),
    },
    body: JSON.stringify({
      name: host.username,
      password: hostPassword,
      ignoreCaptcha: true,
      captcha: "",
      captchaID: Math.random().toString(36).substring(7),
      authMethod: "session",
      language: "zh",
    }),
  })

  const loginData = (await loginResponse.json()) as LoginResponse

  if (loginData.code !== 200) {
    throw new Error(loginData.message || "登录失败")
  }

  // 获取 psession cookie
  const cookies = loginResponse.headers.getSetCookie()
  const psessionCookie = cookies.find(cookie => cookie.startsWith("psession="))
  
  if (!psessionCookie) {
    throw new Error("登录失败:未获取到会话信息")
  }

  // 从 psessionCookie 中提取 sessionId
  const sessionId = psessionCookie.match(/psession=([^;]+)/)?.[1]
  if (!sessionId) {
    throw new Error("无法获取会话ID")
  }

  // 缓存 sessionId，有效期 2 小时
  sessionCache.set(hostId, sessionId, 2 * 60 * 60 * 1000)

  return sessionId
} 