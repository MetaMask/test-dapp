import { getCallsStatusComponent } from './getCallsStatus';
import { getCapabilitiesComponent } from './getCapabilities';
import { sendCallsComponent } from './sendCalls';

export function eip5792Component(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
        <div class="card full-width">
            <div class="card-body eip5792">
                <h4 class="card-title">
                    EIP 5792
                </h4>
                <div id="eip5792SendCalls"></div>
                <hr/>
                <div id="eip5792GetCallsStatus"></div>
                <hr/>
                <div id="eip5792GetCapabilities"></div>
            </div>
        </div>
    </div`,
  );

  sendCallsComponent(document.getElementById('eip5792SendCalls'));
  getCallsStatusComponent(document.getElementById('eip5792GetCallsStatus'));
  getCapabilitiesComponent(document.getElementById('eip5792GetCapabilities'));
}
