import { Request, Response } from 'express';
import { createError } from '../middleware/errorHandler';

const NEWS_POOL = [
  { title: 'Nigerian Startups Raise $50M in Q1 2024', link: '#', source: 'TechCabal', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800' },
  { title: 'Lagos Small Businesses Boom Despite Economic Challenges', link: '#', source: 'BusinessDay', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800' },
  { title: 'New Government Policy Supports Local Artisans', link: '#', source: 'Punch', image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800' },
  { title: 'Digital Marketplace Transforms Nigerian Trade', link: '#', source: 'Vanguard', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' },
  { title: 'Youth Entrepreneurs Lead Innovation in Nigeria', link: '#', source: 'Guardian', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800' },
  { title: 'Local Artisans Get Global Recognition', link: '#', source: 'ThisDay', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800' },
  { title: 'Jos Artisans Embrace Digital Tools for Growth', link: '#', source: 'Plateau News', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800' },
  { title: 'Small Business Grants Now Available in Plateau State', link: '#', source: 'BusinessDay', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800' },
  { title: 'Nigerian Tech Hubs Expand to Secondary Cities', link: '#', source: 'TechCabal', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800' },
  { title: 'Rise of Local E-Commerce in Northern Nigeria', link: '#', source: 'Vanguard', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800' },
  { title: 'Artisan Cooperatives Gain Momentum Across Nigeria', link: '#', source: 'Guardian', image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800' },
  { title: 'Central Bank Unveils New SME Loan Program', link: '#', source: 'Punch', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800' },
  { title: 'Plateau State Hosts Annual Trade Fair for Local Artisans', link: '#', source: 'Plateau News', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' },
  { title: 'Youth Skill Acquisition Program Launches in Jos', link: '#', source: 'ThisDay', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800' },
  { title: 'How Mobile Money is Boosting Small Businesses in Nigeria', link: '#', source: 'BusinessDay', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800' },
];

function shufflePool(): typeof NEWS_POOL {
  const pool = [...NEWS_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export const getNewsFeed = async (req: Request, res: Response) => {
  try {
    const rssUrl = encodeURIComponent(
      'https://news.google.com/rss/search?q=small+business+startups+Nigeria&hl=en-NG&gl=NG&ceid=NG:en'
    );
    const feedUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(feedUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data: any = await response.json();
    if (data.status !== 'ok') throw new Error('Feed API error');

    const items = (data.items || []).slice(0, 6).map((item: any) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: item.author || 'Google News',
      image: item.thumbnail || item.enclosure?.link || shufflePool()[0].image,
    }));

    res.json({ news: items });
  } catch {
    const shuffled = shufflePool().slice(0, 6).map((item) => ({
      ...item,
      pubDate: new Date().toISOString(),
    }));
    res.json({ news: shuffled, fromCache: true });
  }
};
