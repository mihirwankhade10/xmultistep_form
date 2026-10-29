// ===== DATA DEFINITIONS =====
const PLAN_DATA = {
  arcade: {
    name: 'Arcade',
    monthly: 9,
    yearly: 90
  },
  advance: {
    name: 'Advance',
    monthly: 12,
    yearly: 120
  },
  pro: {
    name: 'Pro',
    monthly: 15,
    yearly: 150
  }
};

const ADDON_DATA = {
  online: {
    name: 'Online Services',
    monthly: 1,
    yearly: 10
  },
  storage: {
    name: 'Larger Storage',
    monthly: 2,
    yearly: 20
  },
  profile: {
    name: 'Customizable Profile',
    monthly: 2,
    yearly: 20
  }
};

// ===== STATE =====
const state = {
  step: 1,
  name: "",
  email: "",
  phone: "",
  billing: "monthly", // "monthly" | "yearly"
  plan: null,         // "arcade" | "advance" | "pro" | null
  addons: []          // ["online", "storage", "profile"]
};

// ===== DOM ELEMENTS =====
const form = document.getElementById('multistep-form');
const nextBtn = document.getElementById('next-button');
const backBtn = document.getElementById('back-button');
const nav = document.getElementById('nav');
const thankYouSection = document.getElementById('thank-you');

const nameInput = document.querySelector('input[name="userName"]');
const emailInput = document.querySelector('input[name="email"]');
const phoneInput = document.querySelector('input[name="phone"]');

const errorName = document.getElementById('error-name');
const errorEmail = document.getElementById('error-email');
const errorPhone = document.getElementById('error-phone');
const errorPlan = document.getElementById('error-plan');

const planCards = document.querySelectorAll('.plan_card');
const addonCards = document.querySelectorAll('.addon_card');
const billingToggle = document.getElementById('billing-toggle');
const monthlyLabel = document.querySelector('.monthly-label');
const yearlyLabel = document.querySelector('.yearly-label');

const summaryPlanName = document.getElementById('summary-plan-name');
const summaryPlanPrice = document.getElementById('summary-plan-price');
const summaryAddons = document.getElementById('summary-addons');
const summaryTotalLabel = document.getElementById('summary-total-label');
const summaryTotalPrice = document.getElementById('summary-total-price');
const summaryChangeLink = document.getElementById('summary-change');

const sidebarStepItems = document.querySelectorAll('.step-item');

// ===== HELPER FUNCTIONS =====
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function updateSidebar(stepNum) {
  sidebarStepItems.forEach(item => {
    const itemStep = parseInt(item.getAttribute('data-step'), 10);
    if (itemStep === stepNum) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function updateBillingUI() {
  const isYearly = state.billing === 'yearly';

  // Toggle switch class & labels
  if (isYearly) {
    billingToggle.classList.add('yearly');
    yearlyLabel.classList.add('active-label');
    monthlyLabel.classList.remove('active-label');
  } else {
    billingToggle.classList.remove('yearly');
    monthlyLabel.classList.add('active-label');
    yearlyLabel.classList.remove('active-label');
  }

  // Update Plan card prices and yearly benefits
  planCards.forEach(card => {
    const planKey = card.getAttribute('data-plan');
    const priceEl = card.querySelector('.plan-price');
    const benefitEl = card.querySelector('.plan-yearly-benefit');
    const plan = PLAN_DATA[planKey];

    if (plan && priceEl) {
      if (isYearly) {
        priceEl.textContent = `$${plan.yearly}/yr`;
        if (benefitEl) benefitEl.classList.remove('hidden');
      } else {
        priceEl.textContent = `$${plan.monthly}/mo`;
        if (benefitEl) benefitEl.classList.add('hidden');
      }
    }
  });

  // Update Addon card prices
  addonCards.forEach(card => {
    const addonKey = card.getAttribute('data-addon');
    const priceEl = card.querySelector('.addon-price');
    const addon = ADDON_DATA[addonKey];

    if (addon && priceEl) {
      if (isYearly) {
        priceEl.textContent = `+$${addon.yearly}/yr`;
      } else {
        priceEl.textContent = `+$${addon.monthly}/mo`;
      }
    }
  });
}

function renderSummary() {
  if (!state.plan) return;

  const isYearly = state.billing === 'yearly';
  const suffix = isYearly ? 'yr' : 'mo';
  const planInfo = PLAN_DATA[state.plan];
  const planPrice = isYearly ? planInfo.yearly : planInfo.monthly;

  summaryPlanName.textContent = `${planInfo.name} (${isYearly ? 'Yearly' : 'Monthly'})`;
  summaryPlanPrice.textContent = `$${planPrice}/${suffix}`;

  // Clear and render selected addons
  summaryAddons.innerHTML = '';
  let addonsTotal = 0;

  state.addons.forEach(addonKey => {
    const addon = ADDON_DATA[addonKey];
    if (addon) {
      const addonPrice = isYearly ? addon.yearly : addon.monthly;
      addonsTotal += addonPrice;

      const row = document.createElement('div');
      row.className = 'summary-addon-row';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'summary-addon-name';
      nameSpan.textContent = addon.name;

      const priceSpan = document.createElement('span');
      priceSpan.className = 'summary-addon-price';
      priceSpan.textContent = `+$${addonPrice}/${suffix}`;

      row.appendChild(nameSpan);
      row.appendChild(priceSpan);
      summaryAddons.appendChild(row);
    }
  });

  const total = planPrice + addonsTotal;
  summaryTotalLabel.textContent = `Total (per ${isYearly ? 'year' : 'month'})`;
  summaryTotalPrice.textContent = `+$${total}/${suffix}`;
}

function goToStep(targetStep) {
  state.step = targetStep;

  // Show only target step section
  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    if (stepEl) {
      if (i === targetStep) {
        stepEl.hidden = false;
      } else {
        stepEl.hidden = true;
      }
    }
  }

  // Update navigation buttons
  if (targetStep === 1) {
    backBtn.hidden = true;
  } else {
    backBtn.hidden = false;
  }

  if (targetStep === 4) {
    nextBtn.textContent = 'Confirm';
    nextBtn.classList.add('btn-confirm');
    renderSummary();
  } else {
    nextBtn.textContent = 'Next Step';
    nextBtn.classList.remove('btn-confirm');
  }

  updateSidebar(targetStep);
}

function showThankYou() {
  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    if (stepEl) stepEl.hidden = true;
  }
  nav.hidden = true;
  thankYouSection.hidden = false;
  updateSidebar(4);
}

// ===== VALIDATION =====
function validateStep1() {
  let isValid = true;

  const nameVal = nameInput.value.trim();
  const emailVal = emailInput.value.trim();
  const phoneVal = phoneInput.value.trim();

  // Name validation
  if (!nameVal) {
    errorName.textContent = 'Enter your name';
    nameInput.classList.add('input-error');
    isValid = false;
  } else {
    errorName.textContent = '';
    nameInput.classList.remove('input-error');
  }

  // Email validation
  if (!emailVal) {
    errorEmail.textContent = 'Enter email';
    emailInput.classList.add('input-error');
    isValid = false;
  } else if (!emailRegex.test(emailVal)) {
    errorEmail.textContent = 'Enter a valid email address';
    emailInput.classList.add('input-error');
    isValid = false;
  } else {
    errorEmail.textContent = '';
    emailInput.classList.remove('input-error');
  }

  // Phone validation
  if (!phoneVal) {
    errorPhone.textContent = 'Enter your mobile number';
    phoneInput.classList.add('input-error');
    isValid = false;
  } else {
    errorPhone.textContent = '';
    phoneInput.classList.remove('input-error');
  }

  if (isValid) {
    state.name = nameVal;
    state.email = emailVal;
    state.phone = phoneVal;
  }

  return isValid;
}

function validateStep2() {
  if (!state.plan) {
    errorPlan.textContent = 'Please select a plan';
    return false;
  }
  errorPlan.textContent = '';
  return true;
}

// Clear errors live on input
nameInput.addEventListener('input', () => {
  if (nameInput.value.trim()) {
    errorName.textContent = '';
    nameInput.classList.remove('input-error');
  }
});

emailInput.addEventListener('input', () => {
  const val = emailInput.value.trim();
  if (val && emailRegex.test(val)) {
    errorEmail.textContent = '';
    emailInput.classList.remove('input-error');
  }
});

phoneInput.addEventListener('input', () => {
  if (phoneInput.value.trim()) {
    errorPhone.textContent = '';
    phoneInput.classList.remove('input-error');
  }
});

// ===== EVENT HANDLERS =====

// Prevent native form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
});

// Next / Confirm button
nextBtn.addEventListener('click', () => {
  if (state.step === 1) {
    if (validateStep1()) {
      goToStep(2);
    }
  } else if (state.step === 2) {
    if (validateStep2()) {
      goToStep(3);
    }
  } else if (state.step === 3) {
    goToStep(4);
  } else if (state.step === 4) {
    showThankYou();
  }
});

// Back button
backBtn.addEventListener('click', () => {
  if (state.step > 1) {
    goToStep(state.step - 1);
  }
});

// Plan selection
function selectPlan(planKey) {
  state.plan = planKey;
  errorPlan.textContent = '';

  planCards.forEach(card => {
    if (card.getAttribute('data-plan') === planKey) {
      card.classList.add('selected');
      card.setAttribute('aria-checked', 'true');
    } else {
      card.classList.remove('selected');
      card.setAttribute('aria-checked', 'false');
    }
  });
}

planCards.forEach(card => {
  const planKey = card.getAttribute('data-plan');

  card.addEventListener('click', () => {
    selectPlan(planKey);
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectPlan(planKey);
    }
  });
});

// Billing Toggle
function toggleBilling() {
  state.billing = state.billing === 'monthly' ? 'yearly' : 'monthly';
  updateBillingUI();
}

billingToggle.addEventListener('click', toggleBilling);
monthlyLabel.addEventListener('click', () => {
  if (state.billing !== 'monthly') {
    state.billing = 'monthly';
    updateBillingUI();
  }
});
yearlyLabel.addEventListener('click', () => {
  if (state.billing !== 'yearly') {
    state.billing = 'yearly';
    updateBillingUI();
  }
});

// Add-on selection
function toggleAddon(addonKey, card) {
  const index = state.addons.indexOf(addonKey);
  if (index > -1) {
    state.addons.splice(index, 1);
    card.classList.remove('selected');
    card.setAttribute('aria-checked', 'false');
  } else {
    state.addons.push(addonKey);
    card.classList.add('selected');
    card.setAttribute('aria-checked', 'true');
  }
}

addonCards.forEach(card => {
  const addonKey = card.getAttribute('data-addon');

  card.addEventListener('click', () => {
    toggleAddon(addonKey, card);
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleAddon(addonKey, card);
    }
  });
});

// Change link in Step 4
summaryChangeLink.addEventListener('click', (e) => {
  e.preventDefault();
  goToStep(2);
});

// Initialize billing UI
updateBillingUI();
