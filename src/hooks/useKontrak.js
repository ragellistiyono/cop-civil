import { useMemo } from 'react';
import { KONTRAK_DATA } from '../data/kontrak.js';

export function useKontrakList() {
  const kontrakList = useMemo(() => KONTRAK_DATA, []);
  return { kontrakList, loading: false, error: null };
}

export function useKontrakById(id) {
  const kontrak = useMemo(
    () => KONTRAK_DATA.find((k) => k.id === id) ?? null,
    [id]
  );
  return { kontrak, loading: false, error: null };
}
