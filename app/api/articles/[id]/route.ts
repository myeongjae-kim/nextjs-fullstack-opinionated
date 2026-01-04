import { Article } from "@/app/domain/Article";
import { NextRequest } from "next/server";

export const GET = async (_: NextRequest, ctx: RouteContext<'/api/articles/[id]'>) => {
  const { id } = await ctx.params
  return Response.json({
    id: Number(id),
    title: `Article ${id}`,
    content: `Content of article ${id}`,
  } satisfies Article)
}

export const PUT = () => {
  return new Response(null, { status: 200 });
}

export const DELETE = () => {
  return new Response(null, { status: 200 });
}