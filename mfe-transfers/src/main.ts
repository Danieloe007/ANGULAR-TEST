import { initFederation } from '@angular-architects/native-federation';

// Initialize federation to make module available for loading
initFederation()
  .catch(err => console.error(err))
  .then(_ => import('./bootstrap'))
  .catch(err => console.error(err));

// Expose the component globally for manual loading
(window as any).getMfeTransfersComponent = async () => {
  console.log('Loading MFE component...');
  const { TransferComponent } = await import('./app/features/transfer/transfer.component');
  console.log('MFE component loaded:', TransferComponent);
  return TransferComponent;
};

// Make component available immediately for debugging
if (typeof window !== 'undefined') {
  (window as any).mfeDebug = {
    checkComponent: () => (window as any).getMfeTransfersComponent,
    testLoad: async () => {
      try {
        const comp = await (window as any).getMfeTransfersComponent();
        console.log('Test load successful:', comp);
        return comp;
      } catch (error) {
        console.error('Test load failed:', error);
      }
    }
  };
}
