import { transactionBatchButtonsComponent } from "./transactionBatchButtonsComponent";

export function transactionBatchComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
        <div class="card full-width">
            <div class="card-body eip5792">
                <h4 class="card-title">
                    Transaction Batch
                </h4>
                <div id="transactionBatchButtons"></div>
            </div>
        </div>
    </div`,
  );

  transactionBatchButtonsComponent(document.getElementById('transactionBatchButtons'));
}
