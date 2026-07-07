import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Verifikasi token authorization dari Vercel Cron untuk keamanan
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Supabase credentials are not configured in environment variables" },
      { status: 500 }
    );
  }

  try {
    // Ping Supabase REST API (PostgREST) untuk menjaga database tetap aktif.
    // Secara default, ini memanggil root API endpoint. 
    // TIP: Jika Anda memiliki tabel spesifik (misal 'users' atau 'todos'), 
    // Anda bisa menggantinya dengan `${supabaseUrl}/rest/v1/nama_tabel?limit=1` untuk memastikan query menyentuh tabel.
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase ping failed: ${response.statusText}`);
    }

    return NextResponse.json({
      success: true,
      message: "Supabase successfully pinged!",
      status: response.status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
