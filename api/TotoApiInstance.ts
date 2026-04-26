import { TotoAPI } from 'toto-react';
import { ApiName, endpoint } from '@/Config';

export const totoAPI = new TotoAPI((api) => endpoint(api as ApiName) ?? '');
