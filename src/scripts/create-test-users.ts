import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // 生成50个测试用户
  const users = []
  for (let i = 1; i <= 50; i++) {
    const user = {
      email: `user${i}@test.com`,
      name: `测试用户${i}`,
      password: await bcrypt.hash("123456", 10),
      role: "USER",
    }
    users.push(user)
  }

  // 逐个创建用户
  console.log("开始创建测试用户...")
  let createdCount = 0

  for (const user of users) {
    try {
      await prisma.user.create({
        data: user,
      })
      createdCount++
    } catch (error) {
      // 如果是唯一约束错误（邮箱已存在），则跳过
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        console.log(`跳过已存在的用户: ${user.email}`)
        continue
      }
      throw error
    }
  }

  console.log(`成功创建 ${createdCount} 个用户`)

  const count = await prisma.user.count({
    where: {
      role: "USER",
    },
  })
  console.log(`当前普通用户总数：${count}`)
}

main()
  .catch((e) => {
    console.error("创建测试用户失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 