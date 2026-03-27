import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import sharp from 'sharp';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const formData = await request.formData();
    const original = formData.get('original') as File;
    const filtered = formData.get('filtered') as File;

    if (!original || !filtered) {
      return NextResponse.json({ error: '缺少图片' }, { status: 400 });
    }

    // Validate file size
    if (original.size > MAX_FILE_SIZE || filtered.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '图片过大，最大 20MB' }, { status: 400 });
    }

    // Validate MIME type
    if (original.type && !ALLOWED_TYPES.includes(original.type)) {
      return NextResponse.json({ error: '不支持的图片格式' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const folder = `${user.id}/${id}`;

    // Process original: strip EXIF, convert to JPEG, resize if too large
    const originalBuffer = Buffer.from(await original.arrayBuffer());
    const processedOriginal = await sharp(originalBuffer)
      .rotate() // Auto-rotate based on EXIF
      .resize(1920, 2560, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Process filtered: ensure JPEG
    const filteredBuffer = Buffer.from(await filtered.arrayBuffer());
    const processedFiltered = await sharp(filteredBuffer)
      .jpeg({ quality: 90 })
      .toBuffer();

    // Generate real thumbnail from filtered image
    const thumbnail = await sharp(filteredBuffer)
      .resize(400, 533, { fit: 'cover' })
      .jpeg({ quality: 75 })
      .toBuffer();

    // Upload all three in parallel
    const [origResult, filtResult, thumbResult] = await Promise.all([
      supabase.storage
        .from('mood-images')
        .upload(`${folder}/original.jpg`, processedOriginal, {
          contentType: 'image/jpeg',
        }),
      supabase.storage
        .from('mood-images')
        .upload(`${folder}/filtered.jpg`, processedFiltered, {
          contentType: 'image/jpeg',
        }),
      supabase.storage
        .from('mood-images')
        .upload(`${folder}/thumbnail.jpg`, thumbnail, {
          contentType: 'image/jpeg',
        }),
    ]);

    if (origResult.error) throw origResult.error;
    if (filtResult.error) throw filtResult.error;
    if (thumbResult.error) throw thumbResult.error;

    const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mood-images`;

    return NextResponse.json({
      originalUrl: `${baseUrl}/${folder}/original.jpg`,
      filteredUrl: `${baseUrl}/${folder}/filtered.jpg`,
      thumbnailUrl: `${baseUrl}/${folder}/thumbnail.jpg`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
