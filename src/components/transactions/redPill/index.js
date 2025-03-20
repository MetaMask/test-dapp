import { redPillSendComponent } from './claimPrize';

export function redPillSend(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
        <div class="card full-width">
            <div class="card-body">
                <h4 class="card-title">
                    Red Pill Attack
                </h4>
                <div id="redPillSendComponent"></div>
            </div>
        </div>
    </div`,
  );

  redPillSendComponent(document.getElementById('redPillSendComponent'));
}
