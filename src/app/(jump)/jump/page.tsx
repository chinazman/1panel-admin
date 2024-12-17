"use client"

import { Suspense } from "react"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function JumpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const entrance = searchParams.get("entrance")
    const hostName = searchParams.get("hostName")
    const sessionId = searchParams.get("sessionId")

    if (!entrance || !hostName || !sessionId) {
      console.error("缺少必要的参数")
      return
    }

    // 设置 GlobalState
    const globalState = {
      isLoading: false,
      loadingText: "",
      isLogin: true,
      entrance: entrance,
      language: "zh",
      themeConfig: {
        panelName: hostName,
        primary: "#005EEB",
        theme: "auto",
        isGold: false,
        footer: true,
        title: "",
        logo: "",
        logoWithText: "",
        favicon: ""
      },
      openMenuTabs: false,
      isFullScreen: false,
      isOnRestart: false,
      agreeLicense: true,
      hasNewVersion: true,
      ignoreCaptcha: true,
      device: 1,
      lastFilePath: "",
      currentDB: "",
      currentRedisDB: "",
      showEntranceWarn: true,
      defaultNetwork: "all",
      isProductPro: false,
      productProExpires: 0,
      errStatus: ""
    }

    // 保存到 localStorage
    localStorage.setItem("GlobalState", JSON.stringify(globalState))

    // 设置 cookie
    document.cookie = `psession=${sessionId}; path=/`

    // 跳转到主页
    router.push("/")
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">正在跳转...</h2>
        <p className="text-muted-foreground">请稍候</p>
      </div>
    </div>
  )
}

export default function JumpPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">加载中...</h2>
          <p className="text-muted-foreground">请稍候</p>
        </div>
      </div>
    }>
      <JumpContent />
    </Suspense>
  )
} 