// form and UI Selectors
const formSelector = '#loan-form';
const btnGenerateSelector = '#btn-generate-quote';
const quoteContainerSelector = '#generated-quote-section';

// insurance Selectors
const insuranceCheckboxSelector = '#apply-insurance';
const insurancePercentageSelector = '#insurance-percentage';

// extra Payments Selectors
const btnAddPaymentSelector = '#btn-add-extra-payment';
const paymentsContainerSelector = '#extra-payments-container';
const btnDeletePaymentClass = '.btn-delete-payment';

// helper Regex Patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlRegex = /^(https?:\/\/)[^\s]+$/;

// initialize on DOM Ready
$(document).ready(function() {
    
    // toggle insurance percentage input
    $(insuranceCheckboxSelector).on('change', function() {
        handleInsuranceChange();
        updateLiveCalculations();
    });

    // add extra payment row
    $(btnAddPaymentSelector).on('click', function() {
        handleAddExtraPayment();
    });

    // delete extra payment row
    $(paymentsContainerSelector).on('click', btnDeletePaymentClass, function() {
        handleDeleteExtraPayment(this);
    });

    // for input and change on form fields
    $(formSelector).on('input change', 'input, select', function() {
        handleFieldInputOrChange(this);
    });

    //generate quote click event
    $(btnGenerateSelector).on('click', function() {
        handleGenerateQuote();
    });

    // initial calculation state
    updateFinancedAmount();
    resetLiveSummary();
    resetLiveTable();
});

// event handlers 

function handleInsuranceChange() {
    let isChecked = $(insuranceCheckboxSelector).is(':checked');
    let $percentageInput = $(insurancePercentageSelector);

    if (isChecked) {
        $percentageInput.prop('disabled', false).focus();
    } else {
        $percentageInput.val('');
        $percentageInput.prop('disabled', true);
        $percentageInput.removeClass('is-invalid is-valid');
    }
}

function handleAddExtraPayment() {
    const paymentHtml = `
        <div class="row mb-2 g-2 align-items-end extra-payment-row">
            <div class="col-md-3">
                <label class="form-label mb-1">Mes de aplicación <span class="text-danger">*</span></label>
                <input type="number" class="form-control payment-month" placeholder="Ej. 5">
                <div class="invalid-feedback">El mes del pago extraordinario debe estar dentro del plazo del préstamo.</div>
            </div>
            <div class="col-md-3">
                <label class="form-label mb-1">Monto del pago <span class="text-danger">*</span></label>
                <input type="number" step="0.01" class="form-control payment-amount" placeholder="Ej. 10000">
                <div class="invalid-feedback">El monto del pago extraordinario debe ser mayor que cero.</div>
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
    $(paymentsContainerSelector).append(paymentHtml);
    updateLiveCalculations();
}

function handleDeleteExtraPayment(buttonElement) {
    $.confirm({
        title: 'Eliminar pago extraordinario',
        content: '¿Está seguro de que desea eliminar este pago extraordinario?',
        type: 'red',
        buttons: {
            eliminar: {
                text: 'Sí, eliminar',
                btnClass: 'btn-danger',
                action: function () {
                    $(buttonElement).closest('.extra-payment-row').remove();
                    updateLiveCalculations();
                    $.toast({
                        heading: 'Eliminado',
                        text: 'El pago extraordinario fue removido.',
                        icon: 'info',
                        position: 'top-right',
                        hideAfter: 2000
                    });
                }
            },
            cancelar: {
                text: 'Cancelar',
                action: function () {}
            }
        }
    });
}

function handleFieldInputOrChange(element) {
    const $field = $(element);
    
    // error message
    if ($field.hasClass('is-invalid')) {
        validateSingleField($field);
    }

    updateFinancedAmount();
    updateLiveCalculations();
}

function updateFinancedAmount() {
    const reqVal = $('#amount-requested').val();
    const initVal = $('#initial-payment').val();
    const currency = $('#loan-currency').val() || 'DOP';

    if (reqVal !== '' && Number(reqVal) > 0) {
        const reqNum = Number(reqVal);
        const initNum = initVal === '' ? 0 : Number(initVal);
        const financed = Math.max(0, reqNum - initNum);
        $('#financed-amount').val(`${currency} ${financed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    } else {
        $('#financed-amount').val('0.00');
    }
}

// validation functions 

function validateSingleField($el) {
    const id = $el.attr('id');
    const val = $el.val();
    let isValid = true;
    let errorMsg = '';

    const quoteDateVal = $('#quote-date').val();
    const amountReqVal = $('#amount-requested').val();
    const termVal = $('#loan-term').val();

    if (id === 'entity-name') {
        if (!val || val.trim() === '') { isValid = false; errorMsg = 'Debe ingresar el nombre de la entidad financiera.'; }
    } else if (id === 'entity-rnc') {
        if (!val || val.trim() === '') { isValid = false; errorMsg = 'Debe ingresar el RNC o identificación.'; }
    } else if (id === 'entity-phone') {
        if (!val || val.trim() === '') { isValid = false; errorMsg = 'Debe ingresar el teléfono.'; }
    } else if (id === 'entity-email') {
        if (!val || !emailRegex.test(val.trim())) { isValid = false; errorMsg = 'Debe ingresar un correo electrónico válido.'; }
    } else if (id === 'entity-address') {
        if (!val || val.trim() === '') { isValid = false; errorMsg = 'Debe ingresar la dirección.'; }
    } else if (id === 'entity-logo') {
        if (val && val.trim() !== '' && !urlRegex.test(val.trim())) { isValid = false; errorMsg = 'Debe ingresar una URL de logo válida.'; }
    } else if (id === 'client-name') {
        if (!val || val.trim() === '') { isValid = false; errorMsg = 'Debe ingresar el nombre del solicitante.'; }
    } else if (id === 'client-id') {
        if (!val || val.trim() === '') { isValid = false; errorMsg = 'Debe ingresar la identificación del solicitante.'; }
    } else if (id === 'client-phone') {
        if (!val || val.trim() === '') { isValid = false; errorMsg = 'Debe ingresar el teléfono del solicitante.'; }
    } else if (id === 'client-email') {
        if (!val || !emailRegex.test(val.trim())) { isValid = false; errorMsg = 'Debe ingresar un correo electrónico válido.'; }
    } else if (id === 'client-address') {
        if (!val || val.trim() === '') { isValid = false; errorMsg = 'Debe ingresar la dirección del solicitante.'; }
    } else if (id === 'client-income') {
        if (val === '' || Number(val) <= 0) { isValid = false; errorMsg = 'El ingreso mensual debe ser mayor que cero.'; }
    } else if (id === 'loan-type') {
        if (!val) { isValid = false; errorMsg = 'Debe seleccionar un tipo de préstamo.'; }
    } else if (id === 'quote-number') {
        if (!val || val.trim() === '') { isValid = false; errorMsg = 'Debe ingresar el número de cotización.'; }
    } else if (id === 'loan-currency') {
        if (!val) { isValid = false; errorMsg = 'Debe seleccionar la moneda.'; }
    } else if (id === 'quote-date') {
        if (!val) { isValid = false; errorMsg = 'Debe ingresar la fecha de cotización.'; }
    } else if (id === 'expiration-date') {
        if (!val) {
            isValid = false;
            errorMsg = 'Debe ingresar la fecha de vencimiento.';
        } else if (quoteDateVal && val < quoteDateVal) {
            isValid = false;
            errorMsg = 'La fecha de vencimiento debe ser igual o mayor que la fecha de cotización.';
        }
    } else if (id === 'quote-status') {
        if (!val) { isValid = false; errorMsg = 'Debe seleccionar el estado.'; }
    } else if (id === 'amount-requested') {
        if (val === '' || Number(val) <= 0) { isValid = false; errorMsg = 'El monto solicitado debe ser mayor que cero.'; }
    } else if (id === 'initial-payment') {
        if (val !== '') {
            const num = Number(val);
            if (num < 0) {
                isValid = false;
                errorMsg = 'El pago inicial no puede ser menor que cero.';
            } else if (amountReqVal !== '' && num >= Number(amountReqVal)) {
                isValid = false;
                errorMsg = 'El pago inicial debe ser menor que el monto solicitado.';
            }
        }
    } else if (id === 'interest-rate') {
        if (val === '' || Number(val) < 0 || Number(val) > 100) { isValid = false; errorMsg = 'La tasa de interés anual debe estar entre 0 y 100.'; }
    } else if (id === 'loan-term') {
        const num = Number(val);
        if (val === '' || !Number.isInteger(num) || num <= 0 || num > 360) {
            isValid = false;
            errorMsg = 'El plazo en meses debe ser un número entero mayor que cero y menor o igual que 360.';
        }
    } else if (id === 'first-payment-date') {
        if (!val) {
            isValid = false;
            errorMsg = 'Debe ingresar la fecha del primer pago.';
        } else if (quoteDateVal && val < quoteDateVal) {
            isValid = false;
            errorMsg = 'La fecha del primer pago debe ser igual o mayor que la fecha de cotización.';
        }
    } else if (id === 'insurance-percentage') {
        if ($(insuranceCheckboxSelector).is(':checked')) {
            if (val === '' || val.trim() === '') {
                isValid = false;
                errorMsg = 'Debe ingresar el porcentaje de seguro mensual.';
            } else if (Number(val) < 0 || Number(val) > 100) {
                isValid = false;
                errorMsg = 'El porcentaje de seguro mensual debe estar entre 0 y 100.';
            }
        }
    } else if (id === 'admin-fee') {
        if (val !== '' && Number(val) < 0) {
            isValid = false;
            errorMsg = 'La comisión administrativa no puede ser menor que cero.';
        }
    } else if ($el.hasClass('payment-month')) {
        const m = Number(val);
        const maxTerm = Number(termVal) || 360;
        if (val === '' || !Number.isInteger(m) || m <= 0 || m > maxTerm) {
            isValid = false;
            errorMsg = 'El mes del pago extraordinario debe estar dentro del plazo del préstamo.';
        }
    } else if ($el.hasClass('payment-amount')) {
        if (val === '' || Number(val) <= 0) {
            isValid = false;
            errorMsg = 'El monto del pago extraordinario debe ser mayor que cero.';
        }
    }

    if (isValid) {
        $el.removeClass('is-invalid').addClass('is-valid');
    } else {
        $el.removeClass('is-valid').addClass('is-invalid');
        if (errorMsg) {
            $el.siblings('.invalid-feedback').text(errorMsg);
        }
    }

    return isValid;
}

function validateForm() {
    let isValid = true;

    const setFieldError = ($el, message) => {
        $el.removeClass('is-valid').addClass('is-invalid');
        if (message) {
            $el.siblings('.invalid-feedback').text(message);
        }
        isValid = false;
    };

    const setFieldSuccess = ($el) => {
        $el.removeClass('is-invalid').addClass('is-valid');
    };

    // entity Validations
    const $entityName = $('#entity-name');
    if ($entityName.val().trim() === '') { setFieldError($entityName, 'Debe ingresar el nombre de la entidad financiera.'); } else { setFieldSuccess($entityName); }

    const $entityRnc = $('#entity-rnc');
    if ($entityRnc.val().trim() === '') { setFieldError($entityRnc, 'Debe ingresar el RNC o identificación.'); } else { setFieldSuccess($entityRnc); }

    const $entityPhone = $('#entity-phone');
    if ($entityPhone.val().trim() === '') { setFieldError($entityPhone, 'Debe ingresar el teléfono.'); } else { setFieldSuccess($entityPhone); }

    const $entityEmail = $('#entity-email');
    if (!emailRegex.test($entityEmail.val().trim())) { setFieldError($entityEmail, 'Debe ingresar un correo electrónico válido.'); } else { setFieldSuccess($entityEmail); }

    const $entityAddress = $('#entity-address');
    if ($entityAddress.val().trim() === '') { setFieldError($entityAddress, 'Debe ingresar la dirección.'); } else { setFieldSuccess($entityAddress); }

    const $entityLogo = $('#entity-logo');
    if ($entityLogo.val().trim() !== '' && !urlRegex.test($entityLogo.val().trim())) {
        setFieldError($entityLogo, 'Debe ingresar una URL de logo válida.');
    } else {
        $entityLogo.removeClass('is-invalid');
        if ($entityLogo.val().trim() !== '') { $entityLogo.addClass('is-valid'); }
    }

    // client validations
    const $clientName = $('#client-name');
    if ($clientName.val().trim() === '') { setFieldError($clientName, 'Debe ingresar el nombre del solicitante.'); } else { setFieldSuccess($clientName); }

    const $clientId = $('#client-id');
    if ($clientId.val().trim() === '') { setFieldError($clientId, 'Debe ingresar la identificación del solicitante.'); } else { setFieldSuccess($clientId); }

    const $clientPhone = $('#client-phone');
    if ($clientPhone.val().trim() === '') { setFieldError($clientPhone, 'Debe ingresar el teléfono del solicitante.'); } else { setFieldSuccess($clientPhone); }

    const $clientEmail = $('#client-email');
    if (!emailRegex.test($clientEmail.val().trim())) { setFieldError($clientEmail, 'Debe ingresar un correo electrónico válido.'); } else { setFieldSuccess($clientEmail); }

    const $clientAddress = $('#client-address');
    if ($clientAddress.val().trim() === '') { setFieldError($clientAddress, 'Debe ingresar la dirección del solicitante.'); } else { setFieldSuccess($clientAddress); }

    const $clientIncome = $('#client-income');
    if ($clientIncome.val() === '' || Number($clientIncome.val()) <= 0) {
        setFieldError($clientIncome, 'El ingreso mensual debe ser mayor que cero.');
    } else {
        setFieldSuccess($clientIncome);
    }

    // general loan validations
    const $loanType = $('#loan-type');
    if (!$loanType.val()) { setFieldError($loanType, 'Debe seleccionar un tipo de préstamo.'); } else { setFieldSuccess($loanType); }

    const $quoteNumber = $('#quote-number');
    if ($quoteNumber.val().trim() === '') { setFieldError($quoteNumber, 'Debe ingresar el número de cotización.'); } else { setFieldSuccess($quoteNumber); }

    const $loanCurrency = $('#loan-currency');
    if (!$loanCurrency.val()) { setFieldError($loanCurrency, 'Debe seleccionar la moneda.'); } else { setFieldSuccess($loanCurrency); }

    const $quoteDate = $('#quote-date');
    const quoteDateVal = $quoteDate.val();
    if (!quoteDateVal) { setFieldError($quoteDate, 'Debe ingresar la fecha de cotización.'); } else { setFieldSuccess($quoteDate); }

    const $expDate = $('#expiration-date');
    const expDateVal = $expDate.val();
    if (!expDateVal) {
        setFieldError($expDate, 'Debe ingresar la fecha de vencimiento.');
    } else if (quoteDateVal && expDateVal < quoteDateVal) {
        setFieldError($expDate, 'La fecha de vencimiento debe ser igual o mayor que la fecha de cotización.');
    } else {
        setFieldSuccess($expDate);
    }

    const $quoteStatus = $('#quote-status');
    if (!$quoteStatus.val()) { setFieldError($quoteStatus, 'Debe seleccionar el estado.'); } else { setFieldSuccess($quoteStatus); }

    // financial conditions validations
    const $amountReq = $('#amount-requested');
    const amountVal = $amountReq.val();
    let isAmountValid = false;
    if (amountVal === '' || Number(amountVal) <= 0) {
        setFieldError($amountReq, 'El monto solicitado debe ser mayor que cero.');
    } else {
        setFieldSuccess($amountReq);
        isAmountValid = true;
    }

    const $initPayment = $('#initial-payment');
    const initVal = $initPayment.val();
    if (initVal !== '') {
        const initNum = Number(initVal);
        if (initNum < 0) {
            setFieldError($initPayment, 'El pago inicial no puede ser menor que cero.');
        } else if (isAmountValid && initNum >= Number(amountVal)) {
            setFieldError($initPayment, 'El pago inicial debe ser menor que el monto solicitado.');
        } else {
            setFieldSuccess($initPayment);
        }
    } else {
        $initPayment.removeClass('is-invalid');
    }

    const $interestRate = $('#interest-rate');
    const rateVal = $interestRate.val();
    if (rateVal === '' || Number(rateVal) < 0 || Number(rateVal) > 100) {
        setFieldError($interestRate, 'La tasa de interés anual debe estar entre 0 y 100.');
    } else {
        setFieldSuccess($interestRate);
    }

    const $loanTerm = $('#loan-term');
    const termVal = $loanTerm.val();
    let isTermValid = false;
    const termNum = Number(termVal);
    if (termVal === '' || !Number.isInteger(termNum) || termNum <= 0 || termNum > 360) {
        setFieldError($loanTerm, 'El plazo en meses debe ser un número entero mayor que cero y menor o igual que 360.');
    } else {
        setFieldSuccess($loanTerm);
        isTermValid = true;
    }

    const $firstPaymentDate = $('#first-payment-date');
    const firstPayVal = $firstPaymentDate.val();
    if (!firstPayVal) {
        setFieldError($firstPaymentDate, 'Debe ingresar la fecha del primer pago.');
    } else if (quoteDateVal && firstPayVal < quoteDateVal) {
        setFieldError($firstPaymentDate, 'La fecha del primer pago debe ser igual o mayor que la fecha de cotización.');
    } else {
        setFieldSuccess($firstPaymentDate);
    }

    // additional charges and insurance
    const applyInsurance = $(insuranceCheckboxSelector).is(':checked');
    const $insPercentage = $(insurancePercentageSelector);
    if (applyInsurance) {
        const insVal = $insPercentage.val();
        if (insVal === '' || insVal.trim() === '') {
            setFieldError($insPercentage, 'Debe ingresar el porcentaje de seguro mensual.');
        } else if (Number(insVal) < 0 || Number(insVal) > 100) {
            setFieldError($insPercentage, 'El porcentaje de seguro mensual debe estar entre 0 y 100.');
        } else {
            setFieldSuccess($insPercentage);
        }
    } else {
        $insPercentage.removeClass('is-invalid is-valid');
    }

    const $adminFee = $('#admin-fee');
    const adminVal = $adminFee.val();
    if (adminVal !== '' && Number(adminVal) < 0) {
        setFieldError($adminFee, 'La comisión administrativa no puede ser menor que cero.');
    } else if (adminVal !== '') {
        setFieldSuccess($adminFee);
    } else {
        $adminFee.removeClass('is-invalid is-valid');
    }

    // dynamic extra payments validations
    $('.extra-payment-row').each(function() {
        const $mEl = $(this).find('.payment-month');
        const $aEl = $(this).find('.payment-amount');

        const mVal = $mEl.val();
        const mNum = Number(mVal);
        const maxTerm = isTermValid ? termNum : 360;

        if (mVal === '' || !Number.isInteger(mNum) || mNum <= 0 || mNum > maxTerm) {
            setFieldError($mEl, 'El mes del pago extraordinario debe estar dentro del plazo del préstamo.');
        } else {
            setFieldSuccess($mEl);
        }

        const aVal = $aEl.val();
        if (aVal === '' || Number(aVal) <= 0) {
            setFieldError($aEl, 'El monto del pago extraordinario debe ser mayor que cero.');
        } else {
            setFieldSuccess($aEl);
        }
    });

    return isValid;
}

// data gathering function

function getFormData() {
    let data = {
        entityName: $('#entity-name').val() || '',
        entityRnc: $('#entity-rnc').val() || '',
        entityPhone: $('#entity-phone').val() || '',
        entityEmail: $('#entity-email').val() || '',
        entityAddress: $('#entity-address').val() || '',
        entityLogo: $('#entity-logo').val() || '',

        clientName: $('#client-name').val() || '',
        clientId: $('#client-id').val() || '',
        clientPhone: $('#client-phone').val() || '',
        clientEmail: $('#client-email').val() || '',
        clientAddress: $('#client-address').val() || '',
        clientIncome: Number($('#client-income').val()) || 0,

        loanType: $('#loan-type').val() || '',
        quoteNumber: $('#quote-number').val() || '',
        currency: $('#loan-currency').val() || 'DOP',
        quoteDate: $('#quote-date').val() ? new Date($('#quote-date').val() + "T00:00:00") : new Date(),
        expirationDate: $('#expiration-date').val() || '',
        quoteStatus: $('#quote-status').val() || '',

        amountRequested: Number($('#amount-requested').val()) || 0,
        initialPayment: Number($('#initial-payment').val()) || 0,
        annualRate: Number($('#interest-rate').val()) || 0,
        term: Number($('#loan-term').val()) || 0,
        firstPaymentDate: $('#first-payment-date').val() ? new Date($('#first-payment-date').val() + "T00:00:00") : new Date(),
        amortizationType: $('#amortization-type').val() || 'Cuota fija',

        applyInsurance: $(insuranceCheckboxSelector).is(':checked'),
        insurancePercentage: Number($(insurancePercentageSelector).val()) || 0,
        adminFee: Number($('#admin-fee').val()) || 0,
        feeType: $('#fee-type').val() || 'Cobrar como cargo inicial',

        extraPayments: {}
    };

    $('.extra-payment-row').each(function() {
        let month = Number($(this).find('.payment-month').val());
        let amount = Number($(this).find('.payment-amount').val());
        if (month && amount && amount > 0) {
            if (!data.extraPayments[month]) {
                data.extraPayments[month] = 0;
            }
            data.extraPayments[month] += amount;
        }
    });

    data.financedAmount = Math.max(0, data.amountRequested - data.initialPayment);
    data.baseAmount = data.feeType === 'Sumar al monto financiado'
                        ? data.financedAmount + data.adminFee
                        : data.financedAmount;

    data.monthlyRate = data.annualRate / 12 / 100;

    return data;
}

function calculateSchedule(data) {
    let schedule = [];
    let balance = data.baseAmount;
    let originalDay = data.firstPaymentDate.getDate();
    let currentDate = new Date(data.firstPaymentDate);

    let fixedQuotaBase = 0;
    if (data.amortizationType === 'Cuota fija') {
        if (data.monthlyRate > 0) {
            fixedQuotaBase = (data.baseAmount * data.monthlyRate) / (1 - Math.pow(1 + data.monthlyRate, -data.term));
        } else {
            fixedQuotaBase = data.term > 0 ? (data.baseAmount / data.term) : 0;
        }
    }

    let fixedCapitalBase = (data.amortizationType === 'Capital fijo' && data.term > 0) ? (data.baseAmount / data.term) : 0;

    let summary = {
        totalCapital: 0,
        totalInterest: 0,
        totalInsurance: 0,
        totalExtraPayments: 0,
        totalQuotas: 0
    };

    for (let month = 1; month <= data.term; month++) {
        if (balance <= 0) break;

        let initialBalance = balance;
        let interest = initialBalance * data.monthlyRate;
        let insurance = data.applyInsurance ? (initialBalance * data.insurancePercentage / 100) : 0;

        let quotaBase = 0;
        let capital = 0;
        let totalQuota = 0;

        if (data.amortizationType === 'Cuota fija') {
            quotaBase = fixedQuotaBase;
            capital = quotaBase - interest;
            if (capital > initialBalance) {
                capital = initialBalance;
                quotaBase = capital + interest;
            }
            totalQuota = quotaBase + insurance;
        } else {
            capital = fixedCapitalBase;
            if (capital > initialBalance) {
                capital = initialBalance;
            }
            quotaBase = capital + interest;
            totalQuota = quotaBase + insurance;
        }

        let balanceAfterQuota = initialBalance - capital;
        let appliedExtraPayment = 0;

        if (data.extraPayments[month]) {
            appliedExtraPayment = data.extraPayments[month];
            if (appliedExtraPayment > balanceAfterQuota) {
                appliedExtraPayment = balanceAfterQuota;
            }
            balanceAfterQuota -= appliedExtraPayment;
        }

        let finalBalance = balanceAfterQuota < 0 ? 0 : balanceAfterQuota;

        if (month === data.term || finalBalance < 0.0001) {
            finalBalance = 0;
        }

        schedule.push({
            monthIndex: month,
            date: new Date(currentDate),
            initialBalance: initialBalance,
            quotaBase: quotaBase,
            capital: capital,
            interest: interest,
            insurance: insurance,
            extraPayment: appliedExtraPayment,
            totalQuota: totalQuota,
            finalBalance: finalBalance
        });

        summary.totalCapital += capital;
        summary.totalInterest += interest;
        summary.totalInsurance += insurance;
        summary.totalExtraPayments += appliedExtraPayment;
        summary.totalQuotas += totalQuota;

        if (month < data.term) {
            let nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            let lastDayOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
            nextMonth.setDate(Math.min(originalDay, lastDayOfNextMonth));
            currentDate = nextMonth;
        }

        balance = finalBalance;
    }

    return { rows: schedule, summary: summary };
}

// live calculations and rendering

function updateLiveCalculations() {
    const amountVal = $('#amount-requested').val();
    const termVal = $('#loan-term').val();
    const firstPayVal = $('#first-payment-date').val();
    const initVal = $('#initial-payment').val();
    const rateVal = $('#interest-rate').val();

    const amount = Number(amountVal);
    const term = Number(termVal);
    const initialPayment = initVal === '' ? 0 : Number(initVal);
    const rate = Number(rateVal);

    // check if all required fields are valid for calculation
    const canCalculate = amountVal !== '' && amount > 0 &&
                         initialPayment >= 0 && initialPayment < amount &&
                         termVal !== '' && Number.isInteger(term) && term > 0 && term <= 360 &&
                         rateVal !== '' && rate >= 0 && rate <= 100 &&
                         firstPayVal !== '';

    if (!canCalculate) {
        resetLiveSummary();
        resetLiveTable();
        return;
    }

    const data = getFormData();
    const scheduleResult = calculateSchedule(data);
    const rows = scheduleResult.rows;
    const summary = scheduleResult.summary;

    const formatCurrency = (val) => `${data.currency} ${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const firstQuota = rows.length > 0 ? rows[0].totalQuota : 0;
    const totalToPay = data.feeType === 'Cobrar como cargo inicial'
                        ? summary.totalQuotas + data.adminFee
                        : summary.totalQuotas;
    const endDate = rows.length > 0 ? rows[rows.length - 1].date.toLocaleDateString('es-DO') : '-';

    let debtRatio = 0;
    let riskLevel = '-';
    let riskClass = '';
    if (data.clientIncome > 0 && firstQuota > 0) {
        debtRatio = (firstQuota / data.clientIncome) * 100;
        if (debtRatio <= 30) {
            riskLevel = 'Nivel saludable';
            riskClass = 'text-success';
        } else if (debtRatio <= 50) {
            riskLevel = 'Nivel de riesgo medio';
            riskClass = 'text-warning';
        } else {
            riskLevel = 'Nivel de riesgo alto';
            riskClass = 'text-danger';
        }
    }

    // render section
    $('#live-amount-requested').text(formatCurrency(data.amountRequested));
    $('#live-initial-payment').text(formatCurrency(data.initialPayment));
    $('#live-admin-fee').text(`${formatCurrency(data.adminFee)} (${data.feeType})`);
    $('#live-financed-amount').text(formatCurrency(data.financedAmount));
    $('#live-base-amount').text(formatCurrency(data.baseAmount));
    $('#live-annual-rate').text(`${data.annualRate.toFixed(2)}%`);
    $('#live-monthly-rate').text(`${(data.monthlyRate * 100).toFixed(4)}%`);
    $('#live-term').text(`${data.term} meses`);
    $('#live-quotas-count').text(rows.length);
    $('#live-first-quota').text(formatCurrency(firstQuota));
    $('#live-total-capital').text(formatCurrency(summary.totalCapital));
    $('#live-total-interest').text(formatCurrency(summary.totalInterest));
    $('#live-total-insurance').text(formatCurrency(summary.totalInsurance));
    $('#live-total-extra').text(formatCurrency(summary.totalExtraPayments));
    $('#live-total-quotas').text(formatCurrency(summary.totalQuotas));
    $('#live-total-to-pay').text(formatCurrency(totalToPay));
    $('#live-end-date').text(endDate);
    $('#live-debt-ratio').text(debtRatio > 0 ? `${debtRatio.toFixed(2)}%` : '-');
    $('#live-risk-level').text(riskLevel).attr('class', `fw-bold ${riskClass}`);

    
    if (rows.length === 0) {
        resetLiveTable();
    } else {
        const tableHtml = rows.map(row => `
            <tr>
                <td class="text-center">${row.monthIndex}</td>
                <td class="text-center">${row.date.toLocaleDateString('es-DO')}</td>
                <td>${formatCurrency(row.initialBalance)}</td>
                <td>${formatCurrency(row.quotaBase)}</td>
                <td>${formatCurrency(row.capital)}</td>
                <td>${formatCurrency(row.interest)}</td>
                <td>${formatCurrency(row.insurance)}</td>
                <td>${formatCurrency(row.extraPayment)}</td>
                <td class="fw-bold">${formatCurrency(row.totalQuota)}</td>
                <td>${formatCurrency(row.finalBalance)}</td>
            </tr>
        `).join('');
        $('#live-amortization-tbody').html(tableHtml);
    }
}

function resetLiveSummary() {
    $('#live-amount-requested').text('0.00');
    $('#live-initial-payment').text('0.00');
    $('#live-admin-fee').text('0.00');
    $('#live-financed-amount').text('0.00');
    $('#live-base-amount').text('0.00');
    $('#live-annual-rate').text('0.00%');
    $('#live-monthly-rate').text('0.00%');
    $('#live-term').text('0');
    $('#live-quotas-count').text('0');
    $('#live-first-quota').text('0.00');
    $('#live-total-capital').text('0.00');
    $('#live-total-interest').text('0.00');
    $('#live-total-insurance').text('0.00');
    $('#live-total-extra').text('0.00');
    $('#live-total-quotas').text('0.00');
    $('#live-total-to-pay').text('0.00');
    $('#live-end-date').text('-');
    $('#live-debt-ratio').text('0.00%');
    $('#live-risk-level').text('-').attr('class', 'fw-bold');
}

function resetLiveTable() {
    $('#live-amortization-tbody').html(`
        <tr>
            <td colspan="10" class="text-center text-muted py-3">Ingrese los datos requeridos del préstamo para visualizar la tabla en tiempo real.</td>
        </tr>
    `);
}

// quote generation 

function handleGenerateQuote() {
    let isFormValid = validateForm();

    if (isFormValid) {
        $.confirm({
            title: 'Generar Cotización',
            content: '¿Está seguro que desea generar esta cotización con los datos ingresados?',
            type: 'blue',
            buttons: {
                confirmar: {
                    text: 'Sí, generar',
                    btnClass: 'btn-primary',
                    action: function () {
                        generateAmortizationTable();
                        $.toast({
                            heading: '¡Éxito!',
                            text: 'Cotización generada correctamente.',
                            icon: 'success',
                            position: 'top-right',
                            hideAfter: 3500
                        });
                    }
                },
                cancelar: {
                    text: 'Revisar datos',
                    action: function () {}
                }
            }
        });
    } else {
        $.toast({
            heading: 'Error de Validación',
            text: 'Por favor, complete correctamente todos los campos marcados en rojo.',
            icon: 'error',
            position: 'top-right',
            hideAfter: 4500
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function generateAmortizationTable() {
    const data = getFormData();
    const schedule = calculateSchedule(data);

    // verify at least one row was generated
    if (schedule.rows.length === 0) {
        $.toast({
            heading: 'Error',
            text: 'No fue posible generar cuotas en la tabla de amortización.',
            icon: 'error',
            position: 'top-right',
            hideAfter: 4000
        });
        return;
    }

    renderQuote(data, schedule);
    resetForm();
}

function renderQuote(data, scheduleResult) {
    const formatCurrency = (val) => `${data.currency} ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const rows = scheduleResult.rows;
    const summary = scheduleResult.summary;
    const firstQuota = rows.length > 0 ? rows[0].totalQuota : 0;

    // debt ratio and risk level
    const debtRatio = data.clientIncome > 0 ? (firstQuota / data.clientIncome) * 100 : 0;
    let riskLevel = "";
    let riskClass = "";
    if (debtRatio <= 30) {
        riskLevel = "Nivel saludable";
        riskClass = "text-success";
    } else if (debtRatio <= 50) {
        riskLevel = "Nivel de riesgo medio";
        riskClass = "text-warning";
    } else {
        riskLevel = "Nivel de riesgo alto";
        riskClass = "text-danger";
    }

    const totalToPay = data.feeType === 'Cobrar como cargo inicial'
                        ? summary.totalQuotas + data.adminFee
                        : summary.totalQuotas;

    const endDate = rows.length > 0 ? rows[rows.length - 1].date.toLocaleDateString('es-DO') : '-';
    let logoHtml = data.entityLogo ? `<img src="${data.entityLogo}" alt="Logo" style="max-height: 60px;">` : '';

    let html = `
        <div class="card shadow border-primary mt-4">
            <div class="card-header bg-primary text-white">
                <h4 class="mb-0 text-center">Cotización Generada</h4>
            </div>
            <div class="card-body p-4">
                
                <!-- HEADER: Entity Details -->
                <div class="row border-bottom pb-3 mb-4 align-items-center">
                    <div class="col-md-8">
                        <h3 class="fw-bold text-primary mb-1">${data.entityName}</h3>
                        <p class="mb-0 text-secondary">
                            <strong>RNC:</strong> ${data.entityRnc} | 
                            <strong>Tel:</strong> ${data.entityPhone} <br>
                            <strong>Correo:</strong> ${data.entityEmail} <br>
                            <strong>Dirección:</strong> ${data.entityAddress}
                        </p>
                    </div>
                    <div class="col-md-4 text-end">
                        ${logoHtml}
                    </div>
                </div>

                <!-- INFO CARDS: Applicant & Quotation Details -->
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <div class="card h-100 bg-light border-0 shadow-sm">
                            <div class="card-body">
                                <h6 class="fw-bold border-bottom pb-2 text-primary">Datos del Solicitante</h6>
                                <p class="mb-1"><strong>Nombre:</strong> ${data.clientName}</p>
                                <p class="mb-1"><strong>Identificación:</strong> ${data.clientId}</p>
                                <p class="mb-1"><strong>Teléfono:</strong> ${data.clientPhone}</p>
                                <p class="mb-1"><strong>Correo:</strong> ${data.clientEmail}</p>
                                <p class="mb-1"><strong>Dirección:</strong> ${data.clientAddress}</p>
                                <p class="mb-0"><strong>Ingreso Mensual:</strong> ${formatCurrency(data.clientIncome)}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card h-100 bg-light border-0 shadow-sm">
                            <div class="card-body">
                                <h6 class="fw-bold border-bottom pb-2 text-primary">Datos de la Cotización</h6>
                                <p class="mb-1"><strong>Número de Cotización:</strong> ${data.quoteNumber}</p>
                                <p class="mb-1"><strong>Tipo de Préstamo:</strong> ${data.loanType}</p>
                                <p class="mb-1"><strong>Estado:</strong> ${data.quoteStatus}</p>
                                <p class="mb-1"><strong>Moneda:</strong> ${data.currency}</p>
                                <p class="mb-1"><strong>Fecha de Cotización:</strong> ${data.quoteDate.toLocaleDateString('es-DO')}</p>
                                <p class="mb-0"><strong>Fecha de Vencimiento:</strong> ${new Date(data.expirationDate + "T00:00:00").toLocaleDateString('es-DO')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FINANCIAL CONDITIONS -->
                <h5 class="fw-bold text-primary border-bottom pb-2 mb-3">Condiciones Financieras y Cargos</h5>
                <div class="row g-3 mb-4">
                    <div class="col-md-3"><p class="mb-1 text-muted small">Monto Solicitado</p><h6 class="fw-bold">${formatCurrency(data.amountRequested)}</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted small">Pago Inicial</p><h6 class="fw-bold">${formatCurrency(data.initialPayment)}</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted small">Monto Financiado</p><h6 class="fw-bold">${formatCurrency(data.financedAmount)}</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted small">Monto Base Préstamo</p><h6 class="fw-bold">${formatCurrency(data.baseAmount)}</h6></div>
                    
                    <div class="col-md-3"><p class="mb-1 text-muted small">Tasa de Interés Anual</p><h6 class="fw-bold">${data.annualRate}%</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted small">Tasa Mensual</p><h6 class="fw-bold">${(data.monthlyRate * 100).toFixed(4)}%</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted small">Plazo en Meses</p><h6 class="fw-bold">${data.term} meses</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted small">Fecha Primer Pago</p><h6 class="fw-bold">${data.firstPaymentDate.toLocaleDateString('es-DO')}</h6></div>

                    <div class="col-md-3"><p class="mb-1 text-muted small">Tipo de Amortización</p><h6 class="fw-bold">${data.amortizationType}</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted small">Comisión Administrativa</p><h6 class="fw-bold">${formatCurrency(data.adminFee)}</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted small">Forma de Comisión</p><h6 class="fw-bold">${data.feeType}</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted small">Seguro Mensual</p><h6 class="fw-bold">${data.applyInsurance ? data.insurancePercentage + '%' : 'No aplica'}</h6></div>
                </div>

                <!-- FINANCIAL SUMMARY & TOTALS -->
                <h5 class="fw-bold text-primary border-bottom pb-2 mb-3">Resumen Financiero</h5>
                <div class="alert alert-secondary border-0 mb-4 p-3">
                    <div class="row text-center mb-3">
                        <div class="col-md-3"><p class="mb-1 text-muted small">Total Capital Pagado</p><h6 class="fw-bold">${formatCurrency(summary.totalCapital)}</h6></div>
                        <div class="col-md-3"><p class="mb-1 text-muted small">Total Intereses</p><h6 class="fw-bold">${formatCurrency(summary.totalInterest)}</h6></div>
                        <div class="col-md-3"><p class="mb-1 text-muted small">Total Seguro</p><h6 class="fw-bold">${formatCurrency(summary.totalInsurance)}</h6></div>
                        <div class="col-md-3"><p class="mb-1 text-muted small">Total Pagos Extra Aplicados</p><h6 class="fw-bold">${formatCurrency(summary.totalExtraPayments)}</h6></div>
                    </div>
                    <hr class="my-2">
                    <div class="row text-center mb-2">
                        <div class="col-md-3"><p class="mb-1 text-muted small">Cuota Estimada Inicial</p><h5 class="fw-bold text-primary mb-0">${formatCurrency(firstQuota)}</h5></div>
                        <div class="col-md-3"><p class="mb-1 text-muted small">Total Cuotas Pagadas</p><h5 class="fw-bold mb-0">${formatCurrency(summary.totalQuotas)}</h5></div>
                        <div class="col-md-3"><p class="mb-1 text-muted small">Cuotas Generadas / Finaliza</p><h6 class="fw-bold mb-0 mt-1">${rows.length} cuotas / ${endDate}</h6></div>
                        <div class="col-md-3"><p class="mb-1 text-muted small">Total General a Pagar</p><h4 class="fw-bold text-success mb-0">${formatCurrency(totalToPay)}</h4></div>
                    </div>
                    <hr class="my-2">
                    <div class="row text-center align-items-center">
                        <div class="col-12">
                            <span class="text-muted small">Relación Cuota / Ingreso:</span> <strong>${debtRatio.toFixed(2)}%</strong> &nbsp;|&nbsp;
                            <span class="text-muted small">Nivel de Endeudamiento:</span> <span class="fw-bold ${riskClass}">${riskLevel}</span>
                        </div>
                    </div>
                </div>

                <!-- SCHEDULE TABLE -->
                <h5 class="fw-bold text-primary border-bottom pb-2 mb-3">Tabla de Amortización</h5>
                <div class="table-responsive" style="max-height: 450px; overflow-y: auto;">
                    <table class="table table-striped table-hover table-bordered text-end align-middle mb-0">
                        <thead class="table-primary text-center align-middle sticky-top">
                            <tr>
                                <th>#</th>
                                <th>Fecha</th>
                                <th>Balance Inicial</th>
                                <th>Cuota Base</th>
                                <th>Capital</th>
                                <th>Interés</th>
                                <th>Seguro</th>
                                <th>Pago Extra</th>
                                <th>Cuota Total</th>
                                <th>Balance Final</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.map(row => `
                                <tr>
                                    <td class="text-center">${row.monthIndex}</td>
                                    <td class="text-center">${row.date.toLocaleDateString('es-DO')}</td>
                                    <td>${formatCurrency(row.initialBalance)}</td>
                                    <td>${formatCurrency(row.quotaBase)}</td>
                                    <td>${formatCurrency(row.capital)}</td>
                                    <td>${formatCurrency(row.interest)}</td>
                                    <td>${formatCurrency(row.insurance)}</td>
                                    <td>${formatCurrency(row.extraPayment)}</td>
                                    <td class="fw-bold">${formatCurrency(row.totalQuota)}</td>
                                    <td>${formatCurrency(row.finalBalance)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- FOOTER -->
                <div class="text-center mt-4 text-muted small">
                    <p class="mb-0">Fecha y hora exacta de generación: ${new Date().toLocaleString('es-DO')}</p>
                </div>
            </div>
        </div>
    `;

    // replace previous quotation and keep it visible
    $(quoteContainerSelector).html(html).removeClass('d-none');
    $('html, body').animate({ scrollTop: $(quoteContainerSelector).offset().top - 20 }, 500);
}

function resetForm() {
    // reset standard form fields
    $(formSelector)[0].reset();

    // remove validation classes and messages
    $(formSelector).find('.is-valid, .is-invalid').removeClass('is-valid is-invalid');

    // reset calculated fields to zero with two decimals
    $('#financed-amount').val('0.00');

    // return selects to default first options
    $('#loan-type').val('');
    $('#loan-currency').val('');
    $('#quote-status').val('');
    $('#amortization-type').val('Cuota fija');
    $('#fee-type').val('Cobrar como cargo inicial');

    // uncheck checkboxes and disable insurance percentage
    $(insuranceCheckboxSelector).prop('checked', false);
    $(insurancePercentageSelector).val('').prop('disabled', true);

    // clear extra payments list
    $(paymentsContainerSelector).empty();

    // reset live summary to zero and table to empty
    resetLiveSummary();
    resetLiveTable();
}