import { initFederation } from '@angular-architects/native-federation';

// Initialize federation to make module available for loading
initFederation()
  .catch(err => console.error(err))
  .then(_ => import('./bootstrap'))
  .catch(err => console.error(err));

// Expose the component globally for manual loading
(window as any).getMfeTransfersComponent = async () => {
  const { TransferComponent } = await import('./app/features/transfer/transfer.component');
  return TransferComponent;
};
