import { randomUUID } from 'node:crypto';
import { requireAdmin } from '@/server/supabase-admin';
import type { DressUnitStatus } from '@/types';

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin(request);
    const [unitsResult, dressesResult] = await Promise.all([
      supabase.from('dress_units').select('*,dresses(id,name)').order('unit_code'),
      supabase.from('dresses').select('id,name,sizes,colors').order('name'),
    ]);
    if (unitsResult.error) throw unitsResult.error;
    if (dressesResult.error) throw dressesResult.error;
    const dresses = (dressesResult.data || []).map((dress) => ({
      ...dress,
      sizes: dress.sizes || [],
      colors: dress.colors || [],
    }));
    return Response.json({ units: unitsResult.data || [], dresses });
  } catch (cause) {
    const status = cause instanceof Error && 'status' in cause ? Number(cause.status) : 500;
    return Response.json({ error: cause instanceof Error ? cause.message : 'Unit gagal dimuat.' }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin(request);
    const body = await request.json() as { dressId?: string; unitCode?: string; size?: string; color?: string; status?: DressUnitStatus; notes?: string };
    if (!body.dressId || !body.unitCode?.trim() || !body.size?.trim() || !body.color?.trim()) {
      return Response.json({ error: 'Model, kode unit, ukuran, dan warna wajib diisi.' }, { status: 400 });
    }
    const { data, error } = await supabase.from('dress_units').insert({
      id: randomUUID(), dress_id: body.dressId, unit_code: body.unitCode.trim().toUpperCase(),
      size: body.size.trim(), color: body.color.trim(), status: body.status || 'ready', notes: body.notes?.trim() || null,
    }).select('*').single();
    if (error) throw error;
    return Response.json({ unit: data }, { status: 201 });
  } catch (cause) {
    return Response.json({ error: cause instanceof Error ? cause.message : 'Unit gagal disimpan.' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase } = await requireAdmin(request);
    const body = await request.json() as { id?: string; unitCode?: string; size?: string; color?: string; status?: DressUnitStatus; notes?: string };
    if (!body.id) return Response.json({ error: 'ID unit wajib diisi.' }, { status: 400 });
    const { id, ...changes } = body;
    const row = {
      ...(changes.unitCode ? { unit_code: changes.unitCode.trim().toUpperCase() } : {}),
      ...(changes.size ? { size: changes.size.trim() } : {}),
      ...(changes.color ? { color: changes.color.trim() } : {}),
      ...(changes.status ? { status: changes.status } : {}),
      ...(changes.notes !== undefined ? { notes: changes.notes.trim() || null } : {}),
    };
    const { data, error } = await supabase.from('dress_units').update(row).eq('id', id).select('*').single();
    if (error) throw error;
    return Response.json({ unit: data });
  } catch (cause) {
    return Response.json({ error: cause instanceof Error ? cause.message : 'Unit gagal diperbarui.' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { supabase } = await requireAdmin(request);
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return Response.json({ error: 'ID unit wajib diisi.' }, { status: 400 });
    const { error } = await supabase.from('dress_units').update({ status: 'retired' }).eq('id', id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (cause) {
    return Response.json({ error: cause instanceof Error ? cause.message : 'Unit gagal dinonaktifkan.' }, { status: 400 });
  }
}
