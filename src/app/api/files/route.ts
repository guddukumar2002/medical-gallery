import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fileQuerySchema, fileUploadSchema } from "@/lib/validations";
import { uploadFile } from "@/lib/storage";
import { getFileType, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const parsed = fileQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      categoryId: searchParams.get("categoryId") || undefined,
      search: searchParams.get("search") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
    }

    const { page, limit, categoryId, search } = parsed.data;
    const skip = (page - 1) * limit;

    const where = {
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.medicalFile.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.medicalFile.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | undefined;
    const categoryId = formData.get("categoryId") as string;

    const metaParsed = fileUploadSchema.safeParse({ title, description, categoryId });
    if (!metaParsed.success) {
      return NextResponse.json({ error: "Validation failed", details: metaParsed.error.flatten() }, { status: 400 });
    }

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const fileType = getFileType(file.type);
    if (!fileType) return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const { fileKey, fileUrl } = await uploadFile(buffer, file.name, file.type);

    const medicalFile = await prisma.medicalFile.create({
      data: {
        title: metaParsed.data.title,
        description: metaParsed.data.description,
        fileUrl,
        fileKey,
        fileType,
        fileSize: file.size,
        categoryId: metaParsed.data.categoryId,
      },
      include: { category: true },
    });

    return NextResponse.json(medicalFile, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to upload file", details: String(err) }, { status: 500 });
  }
}


