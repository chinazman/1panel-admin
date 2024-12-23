import { prisma } from "./prisma"
import { getHostSessionId } from "./host"

interface SearchResponse {
  code: number
  message: string
  data: {
    total: number
    items: Array<{
      id: number
      name: string
    }>
  }
}

interface ConfigResponse {
  code: number
  message: string
  data: {
    content: string
  }
}

interface UpdateResponse {
  code: number
  message: string
  data: Record<string, never>
}

export async function refreshNginxConfig(panelDomain: string) {
  try {
    // 1. 获取 main 主机信息
    const mainHost = await prisma.host.findUnique({
      where: { code: "main" }
    })
    if (!mainHost) {
      throw new Error("未找到主面板配置")
    }

    const api_url = mainHost.url
    let sessionId = await getHostSessionId(mainHost.id)

    // 2. 查找网站 ID
    const searchResponse = await fetch(`${api_url}/api/v1/websites/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `psession=${sessionId}`
      },
      body: JSON.stringify({
        name: `main.${panelDomain}`,
        page: 1,
        pageSize: 10,
        orderBy: "created_at",
        order: "null",
        websiteGroupId: 0
      })
    })

    let searchData = (await searchResponse.json()) as SearchResponse
    if (searchData.code === 401) {
      // 重新获取没有缓存的 sessionId
      sessionId = await getHostSessionId(mainHost.id, false)
      // 重新发起请求
      const retryResponse = await fetch(`${api_url}/api/v1/websites/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
          "Cookie": `psession=${sessionId}`
        },
        body: JSON.stringify({
          name: `main.${panelDomain}`,
          page: 1,
          pageSize: 10,
          orderBy: "created_at",
          order: "null",
          websiteGroupId: 0
        })
      })
      searchData = (await retryResponse.json()) as SearchResponse
    }
    if (searchData.code !== 200 || !searchData.data.items.length) {
      console.error(`查找网站配置失败: ${searchData.message || '未找到网站配置'}`)
      return
    }

    const websiteId = searchData.data.items[0].id

    // 3. 获取当前配置
    const configResponse = await fetch(`${api_url}/api/v1/websites/${websiteId}/config/openresty`, {
      headers: {
        "Cookie": `psession=${sessionId}`
      }
    })

    const configData = (await configResponse.json()) as ConfigResponse
    if (configData.code !== 200) {
      console.error(`获取配置失败: ${configData.message}`)
      return
    }

    // 4. 获取所有主机信息
    const hosts = await prisma.host.findMany({
      select: {
        code: true,
        url: true
      }
    })

    // 5. 生成新的配置内容
    const upstreamConfigs = hosts.map(host => `upstream ${host.code} {
    # ${host.code}面板
    server ${new URL(host.url).host}; 
}`).join("\n")

    const mapConfigs = hosts.map(host => 
      `    ${host.code}.${panelDomain} ${host.code};`
    ).join(" \n")

    // 提取最后一个 server { 后面的内容
    const parts = configData.data.content.split("server {")
    const serverConfig = parts[parts.length - 1] || ""

    const newContent = `${upstreamConfigs}

# 使用 map 选择后端
map $host $backend_server {
    default main;  
${mapConfigs}
    # 可以继续添加更多的子域名映射
}

server {${serverConfig}`
    // 6. 更新配置
    const updateResponse = await fetch(`${api_url}/api/v1/websites/nginx/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `psession=${sessionId}`
      },
      body: JSON.stringify({
        id: websiteId,
        content: newContent
      })
    })

    const updateData = (await updateResponse.json()) as UpdateResponse
    if (updateData.code !== 200) {
      console.error(`更新配置失败: ${updateData.message}`)
      return
    }

  } catch (error) {
    console.error("刷新 Nginx 配置失败:", error)
    // 不再抛出错误
  }
} 