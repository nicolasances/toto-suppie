import { TotoAPI } from 'toto-react';
import { endpoint } from '@/Config';

export const totoAPI = new TotoAPI((api) => endpoint(api as any) ?? '');
