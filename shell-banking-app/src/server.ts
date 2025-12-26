import { initNodeFederation } from '@softarc/native-federation-node';

console.log('Starting SSR for Shell');

(async () => {

  await initNodeFederation({
    remotesOrManifestUrl: {
  'mfe1': 'http://localhost:3000/remoteEntry.json'
},
    relBundlePath: '../browser/',
  });

  await import('./bootstrap-server');

})();
