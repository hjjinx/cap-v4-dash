import { writable } from 'svelte/store';

export const component = writable<any>('');
export const prices = writable<any[]>([]);
export const showPositionInfoModal = writable<any>(null);
export const sharePositionModal = writable<any>(null);