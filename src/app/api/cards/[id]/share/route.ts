import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import satori from 'satori';
import sharp from 'sharp';
import { getMoodConfig } from '@/lib/constants';
import React from 'react';

const WIDTH = 1080;
const HEIGHT = 1440;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: card, error } = await supabase
      .from('mood_cards')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !card) {
      return NextResponse.json({ error: '找不到卡片' }, { status: 404 });
    }

    // Fetch the card image as base64
    const imageRes = await fetch(card.image_url);
    const imageBuffer = await imageRes.arrayBuffer();
    const imageBase64 = `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`;

    // Fetch fonts
    const [interRes, notoRes] = await Promise.all([
      fetch(
        'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2'
      ),
      fetch(
        'https://fonts.gstatic.com/s/notosanssc/v37/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYxNbPzS5HE.woff2'
      ),
    ]);
    const [interFont, notoFont] = await Promise.all([
      interRes.arrayBuffer(),
      notoRes.arrayBuffer(),
    ]);

    const moodConfig = getMoodConfig(card.mood);
    const dateStr = new Date(card.created_at).toLocaleDateString('zh-CN');

    const element = React.createElement(
      'div',
      {
        style: {
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column' as const,
          position: 'relative' as const,
          backgroundColor: '#0A0A0B',
        },
      },
      // Background image
      React.createElement('img', {
        src: imageBase64,
        style: {
          position: 'absolute' as const,
          top: 0,
          left: 0,
          width: WIDTH,
          height: HEIGHT,
          objectFit: 'cover' as const,
        },
      }),
      // Gradient overlay
      React.createElement('div', {
        style: {
          position: 'absolute' as const,
          bottom: 0,
          left: 0,
          right: 0,
          height: HEIGHT * 0.5,
          background:
            'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
        },
      }),
      // Mood badge
      React.createElement(
        'div',
        {
          style: {
            position: 'absolute' as const,
            top: 40,
            right: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 999,
            backgroundColor: `${moodConfig.color}33`,
            border: `1px solid ${moodConfig.color}66`,
          },
        },
        React.createElement('span', { style: { fontSize: 24 } }, moodConfig.emoji),
        React.createElement(
          'span',
          { style: { fontSize: 20, color: moodConfig.color, fontWeight: 500 } },
          moodConfig.label
        )
      ),
      // Bottom content
      React.createElement(
        'div',
        {
          style: {
            position: 'absolute' as const,
            bottom: 0,
            left: 0,
            right: 0,
            padding: '60px 50px',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 16,
          },
        },
        // Caption
        React.createElement(
          'p',
          {
            style: {
              fontSize: 36,
              fontWeight: 300,
              color: 'white',
              lineHeight: 1.5,
              margin: 0,
            },
          },
          card.caption
        ),
        // Location + date
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
          },
          React.createElement(
            'span',
            { style: { fontSize: 16, color: 'rgba(255,255,255,0.5)' } },
            card.location_name ? `📍 ${card.location_name}` : ''
          ),
          React.createElement(
            'span',
            { style: { fontSize: 14, color: 'rgba(255,255,255,0.3)' } },
            dateStr
          )
        ),
        // Watermark
        React.createElement(
          'span',
          {
            style: {
              marginTop: 20,
              fontSize: 16,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: 4,
            },
          },
          'Wisp'
        )
      )
    );

    const svg = await satori(element, {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'Inter', data: interFont, weight: 300, style: 'normal' as const },
        { name: 'Noto Sans SC', data: notoFont, weight: 400, style: 'normal' as const },
      ],
    });

    const png = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer();

    const download = request.nextUrl.searchParams.get('download') === 'true';

    return new NextResponse(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...(download && {
          'Content-Disposition': `attachment; filename="wisp-${id}.png"`,
        }),
      },
    });
  } catch (error) {
    console.error('Share image error:', error);
    return NextResponse.json({ error: '生成分享图失败' }, { status: 500 });
  }
}
