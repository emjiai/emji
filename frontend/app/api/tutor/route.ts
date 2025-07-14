import { db } from "@/utils/db";
import { Tutor, Message, Category } from "@/utils/schema";
import { eq, ilike, desc, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { src, name, description, instructions, seed, categoryId } = body;

    if (!user || !user.id || !user.firstName) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (
      !src ||
      !name ||
      !description ||
      !instructions ||
      !seed ||
      !categoryId
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // TODO: Check for subscription

    {/* prettier-ignore */}
    const [tutor] = await db
      .insert(Tutor)
      .values({
        categoryId,
        userId: user.id,
        userName: user.firstName,
        src,
        name,
        description,
        instructions,
        seed,
      })
      .returning();

    return NextResponse.json(tutor);
  } catch (error) {
    console.log("[TUTOR_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const name = searchParams.get("name");
  const id = searchParams.get("id");

  // If an ID is specified, fetch just that single tutor
  if (id) {
    try {
      const tutorData = await db
        .select({
          id: Tutor.id,
          name: Tutor.name,
          categoryId: Tutor.categoryId,
          createdAt: Tutor.createdAt,
          userId: Tutor.userId,
          userName: Tutor.userName,
          src: Tutor.src,
          description: Tutor.description,
          instructions: Tutor.instructions,
          seed: Tutor.seed,
          updatedAt: Tutor.updatedAt,
          messageCount: sql`count(${Message.id})`.as("messageCount"),
        })
        .from(Tutor)
        .leftJoin(Message, eq(Message.tutorId, Tutor.id))
        .where(eq(Tutor.id, id))
        .groupBy(Tutor.id);

      if (tutorData.length === 0) {
        return new NextResponse("Tutor not found", { status: 404 });
      }

      const tutor = {
        ...tutorData[0],
        _count: {
          messages: Number(tutorData[0].messageCount),
        },
      };

      return NextResponse.json(tutor);
    } catch (error) {
      console.log("[TUTOR_GET_BY_ID]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }

  // Otherwise, get all tutors with optional filters
  const tutorsData = await db
    .select({
      id: Tutor.id,
      name: Tutor.name,
      categoryId: Tutor.categoryId,
      createdAt: Tutor.createdAt,
      userId: Tutor.userId,
      userName: Tutor.userName,
      src: Tutor.src,
      description: Tutor.description,
      instructions: Tutor.instructions,
      seed: Tutor.seed,
      updatedAt: Tutor.updatedAt,
      messageCount: sql`count(${Message.id})`.as("messageCount"),
    })
    .from(Tutor)
    .leftJoin(Message, eq(Message.tutorId, Tutor.id))
    .where(
      and(
        categoryId ? eq(Tutor.categoryId, categoryId) : undefined,
        name ? ilike(Tutor.name, `%${name}%`) : undefined
      )
    )
    .groupBy(Tutor.id)
    .orderBy(desc(Tutor.createdAt));

  const data = tutorsData.map((tutor) => ({
    ...tutor,
    _count: {
      messages: Number(tutor.messageCount),
    },
  }));

  return NextResponse.json(data);
}
