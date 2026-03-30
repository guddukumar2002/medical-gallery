import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [totalFiles, totalCategories, filesByType, recentFiles] = await Promise.all([
      prisma.medicalFile.count(),
      prisma.category.count(),
      prisma.medicalFile.groupBy({ by: ["fileType"], _count: true }),
      prisma.medicalFile.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { category: true },
      }),
    ]);

    const totalSize = await prisma.medicalFile.aggregate({ _sum: { fileSize: true } });

    return NextResponse.json({
      totalFiles,
      totalCategories,
      totalSize: totalSize._sum.fileSize ?? 0,
      filesByType,
      recentFiles,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
