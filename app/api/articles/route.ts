import { Article } from "@/app/domain/Article";

export const GET = async () => {
  return Response.json({
    content: [1, 2, 3].map((id) => {
      return {
        id,
        title: `Article ${id}`,
        content: `Content of article ${id}`,
      }
    }) satisfies Article[]
  })
}

export const POST = () => {
  return Response.json({
    id: 1
  })
}