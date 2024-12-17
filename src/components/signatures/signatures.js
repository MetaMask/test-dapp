import { ethSignComponent } from './eth-sign';
import { malformedSignaturesComponent } from './malformed-signatures';
import { permitSignComponent } from './permit-sign';
import { personalSignComponent } from './personal-sign';
import { signTypedDataComponent } from './signTypedData';
import { signTypedDataVariantsComponent } from './signTypedData-variants';
import { signTypedDataV3Component } from './signTypedDataV3-sign';
import { signTypedDataV4Component } from './signTypedDataV4-sign';
import { siweComponent } from './siwe';

export function signaturesComponent() {
  // Main container for all signature components
  const parentContainer =
    document.getElementById('signatures') || document.body;

  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="row" id='signatures-row'>
        <!-- Components will be injected here -->
     </div>`,
  );

  const signatureContainer =
    document.getElementById('signatures-row') || parentContainer;

  const components = [
    ethSignComponent,
    personalSignComponent,
    signTypedDataComponent,
    signTypedDataV3Component,
    signTypedDataV4Component,
    permitSignComponent,
    signTypedDataVariantsComponent,
    siweComponent,
    malformedSignaturesComponent,
  ];

  components.forEach((component) => {
    try {
      component(signatureContainer);
    } catch (error) {
      console.error(`Failed to initialize component: ${component.name}`, error);
    }
  });
}
