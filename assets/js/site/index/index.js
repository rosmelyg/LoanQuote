// forms and containers
const formSelector = '#loan-form';
const btnGenerateSelector = '#btn-generate-quote';
const quoteContainerSelector = '#generated-quote-section';

// insurance selectors
const insuranceCheckboxSelector = '#apply-insurance';
const insurancePercentageSelector = '#insurance-percentage';

// extraordinary Payment Selectors
const btnAddPaymentSelector = '#btn-add-extra-payment';
const paymentsContainerSelector = '#extra-payments-container';
const btnDeletePaymentClass = '.btn-delete-payment'; 


// events 
$(document).ready(function() {
    
    // event to toggle insurance percentage input when checking the checkbox
    $(insuranceCheckboxSelector).on('change', function() {
        handleInsuranceChange();
    });

    // event to add an extraordinary payment
    $(btnAddPaymentSelector).on('click', function() {
        handleAddExtraPayment();
    });

    // event to delete an extraordinary payment (delegated)
    $(paymentsContainerSelector).on('click', btnDeletePaymentClass, function() {
        handleDeleteExtraPayment(this);
    });

    // event to generate the quote
    $(btnGenerateSelector).on('click', function() {
        handleGenerateQuote();
    });

});


// handlers and logic bussiness
function handleInsuranceChange() {
    let isChecked = $(insuranceCheckboxSelector).is(':checked');
    let $percentageInput =$(insurancePercentageSelector);

    if (isChecked) {
        // if the user checks the box, we enable it.
        $percentageInput.prop('disabled', false);$percentageInput.focus();
    } else {
        // if the user unchecks the box, we disable it and clear its value.
        $percentageInput.val('');
        $percentageInput.prop('disabled', true);$percentageInput.removeClass('is-invalid is-valid'); 
    }
}

// handler to add a new extraordinary payment row to the container
function handleAddExtraPayment() {
    const paymentHtml = `
        <div class="row mb-2 g-2 align-items-end extra-payment-row">
            <div class="col-md-3">
                <label class="form-label mb-1">Mes aplicación <span class="text-danger">*</span></label>
                <input type="number" class="form-control payment-month" placeholder="Ej. 5">
                <div class="invalid-feedback">Mes inválido.</div>
            </div>
            <div class="col-md-3">
                <label class="form-label mb-1">Monto <span class="text-danger">*</span></label>
                <input type="number" step="0.01" class="form-control payment-amount" placeholder="Ej. 10000">
                <div class="invalid-feedback">Monto mayor a 0.</div>
            </div>
            <div class="col-md-4">
                <label class="form-label mb-1">Descripción</label>
                <input type="text" class="form-control payment-desc" placeholder="Opcional">
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-outline-danger w-100 btn-delete-payment">
                    Eliminar
                </button>
            </div>
        </div>
    `;
    
    // append the new payment row to the payments container
    $(paymentsContainerSelector).append(paymentHtml);
}

// handler to delete an extraordinary payment row
function handleDeleteExtraPayment(buttonElement) {
    $(buttonElement).closest('.extra-payment-row').remove();
}