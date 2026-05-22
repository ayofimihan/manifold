import type { Dealer, DealerId } from '@/types';

export const DEALERS: Dealer[] = [
  {
    id: 'dlr_a',
    name: 'Clement Pre-Owned',
    shortName: 'Dealer A',
    metro: 'St. Louis, MO',
    brand: 'Multi-franchise',
    rooftops: 4,
    color: '#2DD4BF',
  },
  {
    id: 'dlr_b',
    name: 'TKO Auto Group',
    shortName: 'Dealer B',
    metro: 'Atlanta, GA',
    brand: 'Toyota / Honda',
    rooftops: 3,
    color: '#F59E0B',
  },
  {
    id: 'dlr_c',
    name: 'Apex Motors',
    shortName: 'Dealer C',
    metro: 'Dallas, TX',
    brand: 'Ford / Lincoln',
    rooftops: 5,
    color: '#A78BFA',
  },
];

export const dealerById = (id: DealerId) => DEALERS.find((d) => d.id === id)!;
