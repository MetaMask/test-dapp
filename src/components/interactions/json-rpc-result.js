export function jsonRpcResult(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
      <div class="card full-width">
        <div class="card-body">
          <h4 class="card-title">
            JSON RPC Result
          </h4>
          <textarea name="json-rpc-response" id="json-rpc-response" rows="5"></textarea>
        </div>
      </div>
    </div>`,
  );
}
