import type { Source } from './types';

export const MAP_SOURCES: Source[] = [{
  id: 'natural-earth-madagascar', title: 'Natural Earth — côtes de Madagascar, 1:10m',
  author: 'Natural Earth, Tom Patterson, Nathaniel Vaughn Kelso et contributeurs',
  url: 'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/',
  category: 'geography', consulted: true, date: 'Consulté le 25 octobre 2026',
  supports: 'Contour réel de Madagascar, Nosy Be et Sainte-Marie extrait du GeoJSON Admin 0 – Countries du dépôt officiel natural-earth-vector. Géométrie simplifiée localement ; côtes et destinations utilisent la même projection. Les repères de ville restent approximatifs et les petits décalages de pastilles sont reliés à leur point géographique.',
  license: 'Données dans le domaine public ; modification et redistribution autorisées. Conditions consultées : https://www.naturalearthdata.com/about/terms-of-use/. Habillage, relief décoratif, personnages et graphisme créés pour Afterhours.',
}, {
  id: 'geonames-maroantsetra', title: 'GeoNames — Maroantsetra (1060283)',
  author: 'GeoNames et contributeurs', url: 'https://www.geonames.org/1060283/maroantsetra.html',
  category: 'geography', consulted: true, date: 'Consulté le 28 octobre 2026',
  supports: 'Ancrage de la ville de Maroantsetra pour le monde 19 : latitude −15,43527, longitude 49,73794, vérifiées dans les résultats GeoNames. Il s’agit de la ville et non du centre du district homonyme.',
  license: 'Données GeoNames sous licence Creative Commons Attribution (CC BY), avec attribution. Conditions consultées : https://www.geonames.org/export/. Aucun service distant appelé pendant le jeu.',
}];
