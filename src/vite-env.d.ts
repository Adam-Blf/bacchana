/// <reference types="vite/client" />
// Types du module virtuel `virtual:pwa-register`, fourni par vite-plugin-pwa a
// la compilation. Sans cette reference le typecheck ne le trouve pas, alors que
// le build, lui, le resout : c'est exactement le genre d'ecart qui fait passer
// une erreur de la CI a la production.
/// <reference types="vite-plugin-pwa/client" />
