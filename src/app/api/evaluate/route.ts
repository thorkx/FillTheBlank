import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const civicNumber = searchParams.get('civicNumber')?.trim();
    const streetName = searchParams.get('streetName')?.trim();
    const unitSize = searchParams.get('unitSize')?.trim();

    if (!civicNumber || !streetName || !unitSize) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Fetch exact matching property
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('*')
      .ilike('street_name', `%${streetName}%`)
      .eq('civic_number', civicNumber)
      .maybeSingle();

    if (propError || !property) {
      return NextResponse.json({ error: 'Address not found in municipal roll.' }, { status: 404 });
    }

    // 2. Fetch hyper-local comps
    const { data: comps } = await supabase
      .from('market_comps')
      .select('asking_rent')
      .eq('postal_code_3', property.postal_code_3)
      .eq('unit_size', unitSize);

    const totalComps = comps?.length || 0;
    let regionalAverageRent = 0;

    if (totalComps > 0) {
      const sum = comps!.reduce((acc, curr) => acc + Number(curr.asking_rent), 0);
      regionalAverageRent = Math.round((sum / totalComps) * 100) / 100;
    }

    return NextResponse.json({
      property: {
        address: `${property.civic_number} ${property.street_name}`,
        assessmentValue: property.assessment_value,
      },
      marketMetrics: {
        totalLocalComps: totalComps,
        regionalAverageRent
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
