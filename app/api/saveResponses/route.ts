import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Log the response to Vercel logs
    console.log("Scorecard Response:", JSON.stringify(data));

    return NextResponse.json({ status: "ok" });
  } catch (error: unknown) {
    let message = "Unknown error";
    if (error instanceof Error) {
      message = error.message;
    }
    console.error(message);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
