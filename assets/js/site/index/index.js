// form and UI containers
const formSelector = '#loan-form';
const btnGenerateSelector = '#btn-generate-quote';
const quoteContainerSelector = '#generated-quote-section';

// insurance specific selectors
const insuranceCheckboxSelector = '#apply-insurance';
const insurancePercentageSelector = '#insurance-percentage';

// extra payments specific selectors
const btnAddPaymentSelector = '#btn-add-extra-payment';
const paymentsContainerSelector = '#extra-payments-container';
const btnDeletePaymentClass = '.btn-delete-payment';

// Helper regex patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlRegex = /^(https?:\/\/)[^\s]+$/;

//events
$(document).ready(function() {
    
    // toggle insurance percentage input
    $(insuranceCheckboxSelector).on('change', function() {
        handleInsuranceChange();
    });

    // add extra payment row
    $(btnAddPaymentSelector).on('click', function() {
        handleAddExtraPayment();
    });

    // delete extra payment row 
    $(paymentsContainerSelector).on('click', btnDeletePaymentClass, function() {
        handleDeleteExtraPayment(this);
    });

    // generate quote click event
    $(btnGenerateSelector).on('click', function() {
        handleGenerateQuote();
    });

});

//handlers and business logic 

function handleInsuranceChange() {
    let isChecked = $(insuranceCheckboxSelector).is(':checked');
    let $percentageInput =$(insurancePercentageSelector);

    if (isChecked) {
        $percentageInput.prop('disabled', false).focus();
    } else {
        $percentageInput.val('');
        $percentageInput.prop('disabled', true);$percentageInput.removeClass('is-invalid is-valid');
    }
}

function handleAddExtraPayment() {
    const paymentHtml = `
        <div class="row mb-2 g-2 align-items-end extra-payment-row">
            <div class="col-md-3">
                <label class="form-label mb-1">Mes aplicación <span class="text-danger">*</span></label>
                <input type="number" class="form-control payment-month" placeholder="Ej. 5">
                <div class="invalid-feedback">El mes del pago extraordinario debe estar dentro del plazo del préstamo.</div>
            </div>
            <div class="col-md-3">
                <label class="form-label mb-1">Monto <span class="text-danger">*</span></label>
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
}

function handleDeleteExtraPayment(buttonElement) {
    $(buttonElement).closest('.extra-payment-row').remove();
}

function handleGenerateQuote() {
    let isFormValid = validateForm();

    if (isFormValid) {
        // to execute mathematical calculations and render the summary or table
        console.log("Validation Passed! Proceeding to generate quote...");
        generateAmortizationTable();
    } else {
        // scroll to the top if validation fails to ensure user sees the red warnings
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

//validations 
function validateForm() {
    let isValid = true;

    // for visual feedback
    const validateField = (selector, conditionFn, customErrorMsg = "") => {
        const $el =$(selector);
        const value = $el.val();
        
        // return false if value is null or undefined 
        if (value === null) {
            $el.removeClass('is-valid').addClass('is-invalid');
            isValid = false;
            return false;
        }

        const passes = conditionFn(value);
        
        if (passes) {
            $el.removeClass('is-invalid').addClass('is-valid');
        } else {
            $el.removeClass('is-valid').addClass('is-invalid');
            if (customErrorMsg) {
                $el.siblings('.invalid-feedback').text(customErrorMsg);
            }
            isValid = false;
        }
        return passes;
    };

    // entity validations
    validateField('#entity-name', val => val.trim() !== '', "Debe ingresar el nombre de la entidad financiera.");
    validateField('#entity-rnc', val => val.trim() !== '');
    validateField('#entity-phone', val => val.trim() !== '');
    validateField('#entity-email', val => emailRegex.test(val), "Debe ingresar un correo electrónico válido.");
    validateField('#entity-address', val => val.trim() !== '');
    validateField('#entity-logo', val => val.trim() === '' || urlRegex.test(val), "Debe ingresar una URL de logo válida.");

    // client validations
    validateField('#client-name', val => val.trim() !== '', "Debe ingresar el nombre del solicitante.");
    validateField('#client-id', val => val.trim() !== '');
    validateField('#client-phone', val => val.trim() !== '');
    validateField('#client-email', val => emailRegex.test(val), "Debe ingresar un correo electrónico válido.");
    validateField('#client-address', val => val.trim() !== '');
    validateField('#client-income', val => Number(val) > 0, "El ingreso mensual debe ser mayor que cero.");

    // general loan validations
    validateField('#loan-type', val => val !== '');
    validateField('#quote-number', val => val.trim() !== '');
    validateField('#loan-currency', val => val !== '');
    
    let isQuoteDateValid = validateField('#quote-date', val => val !== '');
    
    // validate expiration date only if quote date is valid
    validateField('#expiration-date', val => {
        if (val === '') return false;
        if (isQuoteDateValid) {
            const qDate = new Date($('#quote-date').val());
            const eDate = new Date(val);
            return eDate >= qDate;
        }
        return true; 
    }, "La fecha de vencimiento debe ser igual o mayor que la fecha de cotización.");

    validateField('#quote-status', val => val !== '');

    //financial condicions validations
    let isAmountValid = validateField('#amount-requested', val => Number(val) > 0, "El monto solicitado debe ser mayor que cero.");
    
    // must be less than amount requested if amount is valid
    validateField('#initial-payment', val => {
        let payment = val === '' ? 0 : Number(val);
        if (payment < 0) return false;
        if (isAmountValid) {
            return payment < Number($('#amount-requested').val());
        }
        return true;
    }, "El pago inicial debe ser menor que el monto solicitado.");

    validateField('#interest-rate', val => val !== '' && Number(val) >= 0 && Number(val) <= 100, "La tasa de interés anual debe estar entre 0 y 100.");
    
    let isTermValid = validateField('#loan-term', val => {
        const term = Number(val);
        return val !== '' && Number.isInteger(term) && term > 0 && term <= 360;
    }, "El plazo en meses debe ser un número entero mayor que cero y menor o igual que 360.");

    validateField('#first-payment-date', val => {
        if (val === '') return false;
        if (isQuoteDateValid) {
            const qDate = new Date($('#quote-date').val());
            const fDate = new Date(val);
            return fDate >= qDate;
        }
        return true;
    }, "La fecha del primer pago debe ser igual o mayor que la fecha de cotización.");

    // extra Charges and insurance validations
    let applyInsurance = $('#apply-insurance').is(':checked');
    if (applyInsurance) {
        validateField('#insurance-percentage', val => val !== '' && Number(val) >= 0 && Number(val) <= 100, "El porcentaje de seguro mensual debe estar entre 0 y 100.");
    }

    // dynamic extra payments validations
    $('.extra-payment-row').each(function() {
        const $monthEl =$(this).find('.payment-month');
        const $amountEl =$(this).find('.payment-amount');
        
        // check extra payment month
        const monthVal = $monthEl.val();
        let monthValid = true;
        if (monthVal === '' || !Number.isInteger(Number(monthVal)) || Number(monthVal) <= 0 || (isTermValid && Number(monthVal) > Number($('#loan-term').val()))) {
            monthValid = false;
            isValid = false;
        }
        if (monthValid) {
            $monthEl.removeClass('is-invalid').addClass('is-valid');
        } else {
            $monthEl.removeClass('is-valid').addClass('is-invalid');
        }

        // check extra payment amount
        const amountVal = $amountEl.val();
        let amountValid = true;
        if (amountVal === '' || Number(amountVal) <= 0) {
            amountValid = false;
            isValid = false;
        }
        if (amountValid) {
            $amountEl.removeClass('is-invalid').addClass('is-valid');
        } else {
            $amountEl.removeClass('is-valid').addClass('is-invalid');
        }
    });

    return isValid;
}

//core calculation function 
function generateAmortizationTable() {
    const data = getFormData(); // retrieve all form values
    const schedule = calculateSchedule(data);  // perform math calculations
    renderQuote(data, schedule); // render HTML
    resetForm(); // reset form as required by the specifications
}

function getFormData() {
    // extract static inputs
    let data = {
        entityName: $('#entity-name').val(),
        entityRnc: $('#entity-rnc').val(),
        entityPhone: $('#entity-phone').val(),
        entityEmail: $('#entity-email').val(),
        entityAddress: $('#entity-address').val(),
        entityLogo: $('#entity-logo').val(),
        
        clientName: $('#client-name').val(),
        clientId: $('#client-id').val(),
        clientPhone: $('#client-phone').val(),
        clientEmail: $('#client-email').val(),
        clientAddress: $('#client-address').val(),
        clientIncome: Number($('#client-income').val()),
        
        loanType: $('#loan-type').val(),
        quoteNumber: $('#quote-number').val(),
        currency: $('#loan-currency').val(),
        quoteDate: new Date($('#quote-date').val() + "T00:00:00"),
        expirationDate: $('#expiration-date').val(),
        quoteStatus: $('#quote-status').val(),
        
        amountRequested: Number($('#amount-requested').val()),
        initialPayment: Number($('#initial-payment').val()) || 0,
        annualRate: Number($('#interest-rate').val()),
        term: Number($('#loan-term').val()),
        firstPaymentDate: new Date($('#first-payment-date').val() + "T00:00:00"),
        amortizationType: $('#amortization-type').val(),
        
        applyInsurance: $('#apply-insurance').is(':checked'),
        insurancePercentage: Number($('#insurance-percentage').val()) || 0,
        adminFee: Number($('#admin-fee').val()) || 0,
        feeType: $('#fee-type').val(),
        
        extraPayments: {}
    };

    // extract dynamic extra payments into a dictionary 
    $('.extra-payment-row').each(function() {
        let month = Number($(this).find('.payment-month').val());
        let amount = Number($(this).find('.payment-amount').val());
        if (month && amount) {
            if (!data.extraPayments[month]) {
                data.extraPayments[month] = 0;
            }
            data.extraPayments[month] += amount;
        }
    });

    // core variables calculation
    data.financedAmount = data.amountRequested - data.initialPayment;
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
    
    // fixed payment base calculation
    let fixedQuotaBase = 0;
    if (data.amortizationType === 'Cuota fija') {
        if (data.monthlyRate > 0) {
            fixedQuotaBase = (data.baseAmount * data.monthlyRate) / (1 - Math.pow(1 + data.monthlyRate, -data.term));
        } else {
            fixedQuotaBase = data.baseAmount / data.term;
        }
    }
    
    let fixedCapitalBase = data.amortizationType === 'Capital fijo' ? data.baseAmount / data.term : 0;

    let summary = {
        totalCapital: 0,
        totalInterest: 0,
        totalInsurance: 0,
        totalExtraPayments: 0,
        totalQuotas: 0
    };

    for (let month = 1; month <= data.term; month++) {
        if (balance <= 0) break; // terminate early if balance is zero

        let initialBalance = balance;
        let interest = initialBalance * data.monthlyRate;
        let insurance = data.applyInsurance ? (initialBalance * data.insurancePercentage / 100) : 0;
        
        let quotaBase = 0;
        let capital = 0;
        let totalQuota = 0;

        if (data.amortizationType === 'Cuota fija') {
            quotaBase = fixedQuotaBase;
            capital = quotaBase - interest;
            // prevent paying more capital than the remaining balance
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

        // apply extra payment if exists
        if (data.extraPayments[month]) {
            appliedExtraPayment = data.extraPayments[month];
            if (appliedExtraPayment > balanceAfterQuota) {
                appliedExtraPayment = balanceAfterQuota; // adjust if payment is greater than balance
            }
            balanceAfterQuota -= appliedExtraPayment;
        }

        let finalBalance = balanceAfterQuota < 0 ? 0 : balanceAfterQuota;

        // add row to schedule
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

        // accumulate totals
        summary.totalCapital += capital;
        summary.totalInterest += interest;
        summary.totalInsurance += insurance;
        summary.totalExtraPayments += appliedExtraPayment;
        summary.totalQuotas += totalQuota;

        // advance date to next month safely 
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

function renderQuote(data, scheduleResult) {
    const formatCurrency = (val) => `${data.currency} ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const rows = scheduleResult.rows;
    const summary = scheduleResult.summary;
    const firstQuota = rows.length > 0 ? rows[0].totalQuota : 0;
    
    // risk evaluation
    const debtRatio = (firstQuota / data.clientIncome) * 100;
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
    
    // generate HTML
    let logoHtml = data.entityLogo ? `<img src="${data.entityLogo}" alt="Logo" style="max-height: 60px;">` : '';

    let html = `
        <div class="card shadow border-primary mt-4">
            <div class="card-header bg-primary text-white">
                <h4 class="mb-0 text-center">Cotización Generada</h4>
            </div>
            <div class="card-body p-4">
                
                <!-- HEADER: Entity -->
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

                <!-- INFO CARDS -->
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <div class="card h-100 bg-light border-0 shadow-sm">
                            <div class="card-body">
                                <h6 class="fw-bold border-bottom pb-2 text-primary">Datos del Solicitante</h6>
                                <p class="mb-1"><strong>Nombre:</strong> ${data.clientName}</p>
                                <p class="mb-1"><strong>ID:</strong> ${data.clientId}</p>
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
                                <h6 class="fw-bold border-bottom pb-2 text-primary">Datos de Cotización</h6>
                                <p class="mb-1"><strong>Nº Cotización:</strong> ${data.quoteNumber}</p>
                                <p class="mb-1"><strong>Tipo:</strong> ${data.loanType}</p>
                                <p class="mb-1"><strong>Estado:</strong> ${data.quoteStatus}</p>
                                <p class="mb-1"><strong>Fecha Cotización:</strong> ${data.quoteDate.toLocaleDateString('es-DO')}</p>
                                <p class="mb-1"><strong>Fecha Vencimiento:</strong> ${new Date(data.expirationDate + "T00:00:00").toLocaleDateString('es-DO')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FINANCIAL SUMMARY -->
                <h5 class="fw-bold text-primary border-bottom pb-2 mb-3">Resumen Financiero</h5>
                <div class="row g-3 mb-4">
                    <div class="col-md-3"><p class="mb-1 text-muted">Monto Solicitado</p><h6 class="fw-bold">${formatCurrency(data.amountRequested)}</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted">Pago Inicial</p><h6 class="fw-bold">${formatCurrency(data.initialPayment)}</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted">Monto Financiado</p><h6 class="fw-bold">${formatCurrency(data.financedAmount)}</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted">Monto Base Préstamo</p><h6 class="fw-bold">${formatCurrency(data.baseAmount)}</h6></div>
                    
                    <div class="col-md-3"><p class="mb-1 text-muted">Tasa Anual</p><h6 class="fw-bold">${data.annualRate}%</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted">Tasa Mensual</p><h6 class="fw-bold">${(data.monthlyRate * 100).toFixed(2)}%</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted">Plazo en Meses</p><h6 class="fw-bold">${data.term}</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted">Tipo Amortización</p><h6 class="fw-bold">${data.amortizationType}</h6></div>
                    
                    <div class="col-md-3"><p class="mb-1 text-muted">Comisión Adm.</p><h6 class="fw-bold">${formatCurrency(data.adminFee)} (${data.feeType})</h6></div>
                    <div class="col-md-3"><p class="mb-1 text-muted">Seguro Aplicado</p><h6 class="fw-bold">${data.applyInsurance ? data.insurancePercentage + '%' : 'No'}</h6></div>
                    <div class="col-md-6"><p class="mb-1 text-muted">Cuota Estimada Inicial</p><h5 class="fw-bold text-primary">${formatCurrency(firstQuota)}</h5></div>
                </div>

                <!-- AGGREGATE TOTALS -->
                <div class="alert alert-secondary border-0 mb-4">
                    <div class="row text-center">
                        <div class="col-md-3"><p class="mb-1 text-muted">Total Capital</p><h6 class="fw-bold">${formatCurrency(summary.totalCapital)}</h6></div>
                        <div class="col-md-3"><p class="mb-1 text-muted">Total Intereses</p><h6 class="fw-bold">${formatCurrency(summary.totalInterest)}</h6></div>
                        <div class="col-md-3"><p class="mb-1 text-muted">Total Seguro</p><h6 class="fw-bold">${formatCurrency(summary.totalInsurance)}</h6></div>
                        <div class="col-md-3"><p class="mb-1 text-muted">Total Pagos Extra</p><h6 class="fw-bold">${formatCurrency(summary.totalExtraPayments)}</h6></div>
                    </div>
                    <hr>
                    <div class="row text-center align-items-center">
                        <div class="col-md-4">
                            <p class="mb-1 text-muted">Nivel Endeudamiento (${debtRatio.toFixed(2)}%)</p>
                            <h6 class="fw-bold ${riskClass}">${riskLevel}</h6>
                        </div>
                        <div class="col-md-4">
                            <p class="mb-1 text-muted">Cuotas Generadas / Finaliza</p>
                            <h6 class="fw-bold">${rows.length} cuotas / ${endDate}</h6>
                        </div>
                        <div class="col-md-4">
                            <p class="mb-1 text-muted">Total General a Pagar</p>
                            <h4 class="fw-bold text-success">${formatCurrency(totalToPay)}</h4>
                        </div>
                    </div>
                </div>

                <!-- SCHEDULE TABLE -->
                <h5 class="fw-bold text-primary border-bottom pb-2 mb-3">Tabla de Amortización</h5>
                <div class="table-responsive">
                    <table class="table table-striped table-hover table-bordered text-end align-middle">
                        <thead class="table-primary text-center align-middle">
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
                    <p>Cotización generada el ${new Date().toLocaleString('es-DO')}</p>
                </div>
            </div>
        </div>
    `;

    $(quoteContainerSelector).html(html).removeClass('d-none');
}

function resetForm() {
    // standard inputs
    $(formSelector)[0].reset();
    
    // remove validation classes
    $(formSelector).find('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
    
    // reset specific toggles and dynamic areas
    $(insurancePercentageSelector).prop('disabled', true);$(paymentsContainerSelector).empty();
    
}