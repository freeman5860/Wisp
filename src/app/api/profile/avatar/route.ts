import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;
    if (!file) return NextResponse.json({ error: '缺少文件' }, { status: 400 });

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '文件过大（最大5MB）' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const processed = await sharp(buffer)
      .resize(256, 256, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();

    const filePath = `${user.id}/avatar.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('mood-images')
      .upload(filePath, processed, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('mood-images')
      .getPublicUrl(filePath);

    const avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;

    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Upload avatar error:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
