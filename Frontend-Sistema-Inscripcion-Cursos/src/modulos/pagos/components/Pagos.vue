<template>
  <div class="app-wrapper">

    <div class="layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-top"></div>
      </aside>

      <!-- Main content -->
      <main class="main-content">
        <div class="card">
          <h2 class="card-title">Datos para la factura</h2>

          <div class="form-group">
            <label class="form-label">NIT/CI</label>
            <input
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.nitci }"
              placeholder=""
              v-model="form.nitci"
              @blur="validateField('nitci')"
            />
            <span class="error-msg" v-if="errors.nitci">{{ errors.nitci }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Razón Social/Nombre</label>
            <input
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.razonSocial }"
              placeholder=""
              v-model="form.razonSocial"
              @blur="validateField('razonSocial')"
            />
            <span class="error-msg" v-if="errors.razonSocial">{{ errors.razonSocial }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Correo</label>
            <input
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.correo }"
              placeholder=""
              v-model="form.correo"
              @blur="validateField('correo')"
            />
            <span class="error-msg" v-if="errors.correo">{{ errors.correo }}</span>
          </div>

          <div class="payment-buttons">
            <button class="pay-btn visa-btn" @click="openModal('visa')">
              <span class="visa-text">VISA</span>
            </button>

            <button class="pay-btn qr-btn" @click="openModal('qr')">
              <div class="qr-icon">
                <svg viewBox="0 0 100 100" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="5" width="35" height="35" rx="3" fill="none" stroke="black" stroke-width="6"/>
                  <rect x="15" y="15" width="15" height="15" rx="1" fill="black"/>
                  <rect x="60" y="5" width="35" height="35" rx="3" fill="none" stroke="black" stroke-width="6"/>
                  <rect x="70" y="15" width="15" height="15" rx="1" fill="black"/>
                  <rect x="5" y="60" width="35" height="35" rx="3" fill="none" stroke="black" stroke-width="6"/>
                  <rect x="15" y="70" width="15" height="15" rx="1" fill="black"/>
                  <rect x="60" y="60" width="10" height="10" fill="black"/>
                  <rect x="75" y="60" width="10" height="10" fill="black"/>
                  <rect x="60" y="75" width="10" height="10" fill="black"/>
                  <rect x="75" y="75" width="10" height="10" fill="black"/>
                  <rect x="45" y="5" width="10" height="10" fill="black"/>
                  <rect x="45" y="20" width="10" height="10" fill="black"/>
                  <rect x="45" y="35" width="10" height="10" fill="black"/>
                  <rect x="45" y="50" width="10" height="10" fill="black"/>
                  <rect x="60" y="45" width="10" height="10" fill="black"/>
                  <rect x="75" y="45" width="10" height="10" fill="black"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </main>

      <!-- Right sidebar: Items list -->
      <aside class="items-sidebar">
        <div class="items-sidebar-header">
          <span class="items-sidebar-title">Resumen de compra</span>
          <span class="items-count">{{ items.length }} ítem{{ items.length !== 1 ? 's' : '' }}</span>
        </div>

        <div class="items-list" v-if="items.length > 0">
          <div class="item-row" v-for="(item, index) in items" :key="index">
            <div class="item-info">
              <span class="codigo">{{item.id_materia  }}</span>

              <span class="item-name">{{ item.nombre }}</span>
              
            </div>
            <span class="item-price">Bs. {{item.monto }}</span>
          </div>
        </div>

        <div class="items-empty" v-else>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="3" y1="6" x2="21" y2="6" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M16 10a4 4 0 01-8 0" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>Sin ítems</p>
        </div>

        <div class="items-divider"></div>

        <div class="items-total-row">
          <span class="items-total-label">Subtotal</span>
          <span class="items-total-value">Bs. {{ carrito.total }}</span>
        </div>
        <div class="items-total-row total-main">
          <span class="items-total-label">Total</span>
          <span class="items-total-value total-highlight">Bs. {{ carrito.total }}</span>
        </div>
      </aside>
    </div>

    <!-- Overlay -->
    <div class="overlay" v-if="activeModal" @click.self="closeModal"></div>

    <!-- VISA Modal -->
    <div class="modal" v-if="activeModal === 'visa'">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Número de Tarjeta</label>
          <div class="input-icon-wrapper">
            <input
              type="text"
              class="form-input full-width"
              :class="{ 'input-error': cardErrors.cardNumber }"
              placeholder="Value"
              v-model="cardForm.cardNumber"
              @blur="validateCardField('cardNumber')"
              @input="formatCardNumber"
              maxlength="19"
            />
            <span class="input-icon">
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="18" height="12" rx="2" stroke="#9ca3af" stroke-width="1.5" fill="none"/>
                <rect x="1" y="4" width="18" height="2.5" fill="#9ca3af"/>
              </svg>
            </span>
          </div>
          <span class="error-msg" v-if="cardErrors.cardNumber">{{ cardErrors.cardNumber }}</span>
        </div>

        <div class="row-group">
          <div class="form-group flex-1">
            <label class="form-label">Fecha Expiración</label>
            <div class="expiry-row">
              <input
                type="text"
                class="form-input expiry-input"
                :class="{ 'input-error': cardErrors.expiryMM }"
                placeholder="MM"
                v-model="cardForm.expiryMM"
                @blur="validateCardField('expiryMM')"
                maxlength="2"
              />
              <input
                type="text"
                class="form-input expiry-input"
                :class="{ 'input-error': cardErrors.expiryYY }"
                placeholder="YY"
                v-model="cardForm.expiryYY"
                @blur="validateCardField('expiryYY')"
                maxlength="2"
              />
            </div>
            <span class="error-msg" v-if="cardErrors.expiryMM">{{ cardErrors.expiryMM }}</span>
            <span class="error-msg" v-else-if="cardErrors.expiryYY">{{ cardErrors.expiryYY }}</span>
          </div>

          <div class="form-group security-group">
            <label class="form-label">Código Seguridad</label>
            <input
              type="password"
              class="form-input security-input"
              :class="{ 'input-error': cardErrors.cvv }"
              placeholder="Value"
              v-model="cardForm.cvv"
              @blur="validateCardField('cvv')"
              maxlength="4"
            />
            <span class="error-msg" v-if="cardErrors.cvv">{{ cardErrors.cvv }}</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Nombre Titular</label>
          <div class="name-row">
            <input
              type="text"
              class="form-input name-input"
              :class="{ 'input-error': cardErrors.firstName }"
              placeholder="Nombres"
              v-model="cardForm.firstName"
              @blur="validateCardField('firstName')"
            />
            <input
              type="text"
              class="form-input name-input"
              :class="{ 'input-error': cardErrors.lastName }"
              placeholder="Apellidos"
              v-model="cardForm.lastName"
              @blur="validateCardField('lastName')"
            />
          </div>
          <span class="error-msg" v-if="cardErrors.firstName">{{ cardErrors.firstName }}</span>
          <span class="error-msg" v-else-if="cardErrors.lastName">{{ cardErrors.lastName }}</span>
        </div>

        <div class="modal-actions">
          <button class="btn-pagar" @click="submitCard">Pagar</button>
          <button class="btn-regresar" @click="closeModal">Regresar</button>
        </div>

        <p class="modal-note">*Una vez realizado el pago, se enviará la factura &nbsp;electronica al correo electrónico</p>
      </div>
    </div>

    <!-- QR Modal -->
    <div class="modal" v-if="activeModal === 'qr'">
      <div class="modal-body qr-modal-body">
        <div class="qr-container">
          <img src="/src/assets/qrcode.png" alt="QR"/>
        </div>

        <div class="modal-actions">
          <button class="btn-pagar" @click="downloadQR">Descargar</button>
          <button class="btn-pagar" @click="procesarPagoQR">Procesar pago</button>
          <button class="btn-regresar" @click="closeModal">Regresar</button>
        </div>

        <p class="modal-note">*Una vez realizado el pago, se enviará la factura &nbsp;electronica al correo electrónico</p>
      </div>
    </div>

  </div>
   <ModalExito
    :message="mensaje"
    :visible="mostrarExito"
    @close="mostrarExito = false"
  />
  <ModalError
    :message="mensajeModal"
    :visible="mostrarError"
    @close="mostrarError = false"
  />


</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { usarCarrito } from '../../../store/carrito'
// import { pagarInscripcionSimulado } from '../services/tuServicio'
import { inscribirMaterias } from '../../estudiantes/services/estudianteService'
import { pagarInscripcion } from '../../estudiantes/services/estudianteService'
import ModalError from '../../seguridad/components/ModalError.vue'
import ModalExito from '../../seguridad/components/ModalExito.vue'

const mensaje=ref("")

const mostrarExito=ref(false)
const mostrarError=ref(false)

/* ======================
   STORE
====================== */
const carrito = usarCarrito()

const items = computed(() => carrito.cursos)

const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + Number(item.monto), 0)
)

/* ======================
   MODAL
====================== */
const activeModal = ref(null)

const openModal = (type) => {

  // 🔴 Validar factura antes de abrir
  const isValid = validateAllFacturaFields()

  if (!isValid) return

  // ✅ Si todo está bien
  activeModal.value = type
}

const closeModal = () => {
  activeModal.value = null
}

/* ======================
   FORM FACTURA
====================== */
const form = reactive({
  nitci: '',
  razonSocial: '',
  correo: ''
})

const errors = reactive({
  nitci: '',
  razonSocial: '',
  correo: ''
})

const validateField = (field) => {
  if (!form[field]) {
    errors[field] = 'Este campo es obligatorio'
  } else {
    errors[field] = ''
  }
}

/* ======================
   FORM TARJETA
====================== */
const cardForm = reactive({
  cardNumber: '',
  expiryMM: '',
  expiryYY: '',
  cvv: '',
  firstName: '',
  lastName: ''
})

const cardErrors = reactive({
  cardNumber: '',
  expiryMM: '',
  expiryYY: '',
  cvv: '',
  firstName: '',
  lastName: ''
})

const validateCardField = (field) => {
  if (!cardForm[field]) {
    cardErrors[field] = 'Campo obligatorio'
  } else {
    cardErrors[field] = ''
  }
}

const validateAllCardFields = () => {
  let valid = true
  Object.keys(cardForm).forEach(key => {
    if (!cardForm[key]) {
      cardErrors[key] = 'Campo obligatorio'
      valid = false
    }
  })
  return valid
}

const formatCardNumber = () => {
  let value = cardForm.cardNumber.replace(/\D/g, '')
  value = value.match(/.{1,4}/g)?.join(' ') || ''
  cardForm.cardNumber = value
}

/* ======================
   PAGOS
====================== */
const submitCard = async () => {

  if (!validateAllCardFields()) return

  try {

    // 🔥 1️⃣ Crear inscripción
    const data = await inscribirMaterias(
      items.value.map(item => item.id_materia)
    )

    console.log("Inscripción creada:", data)

    const idInscripcion = data.data.inscripcion.id_inscripcion

    // 🔥 2️⃣ Pagar inscripción
    const pago = await pagarInscripcion(idInscripcion, {
      nit_ci: form.nitci,
      razon_social: form.razonSocial,
      correo: form.correo,
      metodo_pago: "TARJETA"
    })

    console.log("Pago realizado:", pago)

    //alert(pago.mensaje_envio_factura || "Pago procesado correctamente")
    mensaje.value="Pago procesado correctamente";
    mostrarExito.value=true;
    carrito.vaciarCarrito()
    closeModal()

  } catch (error) {

    //alert(error?.message || "Error en el proceso de pago")
    mensaje.value="Error en el proceso de pago";
    mostrarError.value=true;
    console.log(error)
  }
}

const downloadQR = () => {
  alert("Descargando QR...")
}

const procesarPagoQR = async () => {

  try {

    // 🔥 1️⃣ Crear inscripción
    const data = await inscribirMaterias(
      items.value.map(item => item.id_materia)
    )

    console.log("Inscripción creada:", data)

    const idInscripcion = data.data.inscripcion.id_inscripcion

    // 🔥 2️⃣ Pagar con QR
    const pago = await pagarInscripcion(idInscripcion, {
      nit_ci: form.nitci,
      razon_social: form.razonSocial,
      correo: form.correo,
      metodo_pago: "QR"
    })

    console.log("Pago QR realizado:", pago)

    mensaje.value="Pago procesado correctamente";
    mostrarExito.value=true;

    carrito.vaciarCarrito()
    closeModal()

  } catch (error) {

    mensaje.value="Error en el proceso de pago";
    mostrarError.value=true;
    console.log(error)
  }
}

const validateAllFacturaFields = () => {
  let valid = true

  Object.keys(form).forEach(key => {
    if (!form[key]) {
      errors[key] = 'Este campo es obligatorio'
      valid = false
    } else {
      errors[key] = ''
    }
  })

  return valid
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
.codigo {
  background: #0b7285;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  width: 30%;
}


.app-wrapper {
  font-family: 'DM Sans', sans-serif;
  background: #e8edf2;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.page-label {
  font-size: 12px;
  color: #6b7280;
  padding: 10px 16px;
}

.layout {
  display: flex;
  flex: 1;
  flex-wrap: wrap; /* 👈 clave */
}

.sidebar {
  width: 48px;
}

@media (max-width: 768px) {
  .sidebar {
    display: none; /* 👈 ocultar en celular */
  }
}

.sidebar-top {
  height: 60px;
  background: #154f66;
}

.main-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: transparent; /* 👈 cambiar */
}

.card {
  width: 100%;
  max-width: 680px;
  margin: 16px;
  background: #ffffff;
  border-radius: 12px;
  padding: 32px 36px 48px;
  margin: 24px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 14px;
  color: #374151;
  font-family: 'DM Sans', sans-serif;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
}

.form-input::placeholder { color: #9ca3af; }
.form-input:focus { border-color: #1a5f7a; }

.form-input.input-error {
  border-color: #ef4444;
  background: #fff5f5;
}

.form-input.full-width { width: 100%; }

.error-msg {
  display: block;
  font-size: 11px;
  color: #ef4444;
  margin-top: 4px;
}

/* Payment buttons */
.payment-buttons {
  display: flex;
  gap: 24px;
  margin-top: 40px;
  justify-content: center;
  flex-wrap: wrap;
}

.pay-btn {
  width: 100%;
  max-width: 160px;
  height: 72px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a9dc5;
  transition: background 0.2s, transform 0.1s;
}

.pay-btn:hover { background: #237fa3; transform: translateY(-1px); }
.pay-btn:active { transform: translateY(0); }

.visa-text {
  font-size: 32px;
  font-weight: 900;
  color: #1a3a8f;
  font-style: italic;
  letter-spacing: 2px;
}

/* Overlay */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 10;
}

/* Modal */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  width: 90%;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: fadeIn 0.2s ease;
  max-width: 460px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -47%); }
  to   { opacity: 1; transform: translate(-50%, -50%); }
}

.modal-body {
  padding: 36px 40px 32px;
}

/* Card number input with icon */
.input-icon-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Expiry + CVV row */
.row-group {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.flex-1 { flex: 1; }

.expiry-row {
  display: flex;
  gap: 10px;
}

.expiry-input {
  width: 70px !important;
}

.security-group {
  flex-shrink: 0;
}

.security-input {
  width: 120px !important;
}

/* Name row */
.name-row {
  display: flex;
  gap: 10px;
}

.name-input {
  width: 175px !important;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
  flex-wrap: wrap; /* 👈 clave */
}

.btn-pagar {
  background: #f5a623;
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 12px 44px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: background 0.2s, transform 0.1s;
}

.btn-pagar:hover { background: #e09410; transform: translateY(-1px); }

.btn-regresar {
  background: #1a5f7a;
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 12px 44px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: background 0.2s, transform 0.1s;
}

.btn-regresar:hover { background: #154f66; transform: translateY(-1px); }

.modal-note {
  font-size: 11px;
  color: #6b7280;
  text-align: center;
  margin-top: 18px;
}

/* QR modal */
.qr-modal-body {
  padding: 24px;
  text-align: center;
}

.qr-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

/* Right items sidebar */
.items-sidebar {
  width: 260px;
  min-width: 260px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 0;
  min-height: 100%;
}

@media (max-width: 1024px) {
  .items-sidebar {
    width: 100%;
    order: 3; /* 👈 se va abajo */
  }
}

.items-sidebar-header {
  background: #1a5f7a;
  padding: 18px 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.items-sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.3px;
}

.items-count {
  font-size: 11px;
  color: #a8d8ea;
}

.items-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 20px;
  border-bottom: 1px solid #f3f4f6;
  gap: 8px;
  transition: background 0.15s;
}

.item-row:hover {
  background: #f8fafc;
}

.item-row:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-qty {
  font-size: 11px;
  color: #9ca3af;
}

.item-price {
  font-size: 13px;
  font-weight: 600;
  color: #1a5f7a;
  white-space: nowrap;
}

.items-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 20px;
  color: #cbd5e1;
}

.items-empty p {
  font-size: 13px;
  color: #94a3b8;
}

.items-divider {
  height: 1px;
  background: #e5e9ef;
  margin: 0 20px;
}

.items-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}

.total-main {
  padding-bottom: 20px;
}

.items-total-label {
  font-size: 13px;
  color: #6b7280;
}

.items-total-value {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.total-highlight {
  font-size: 16px;
  color: #1a5f7a;
}
@media (max-width: 600px) {
  .row-group {
    flex-direction: column;
    gap: 16px;
  }

  .name-row {
    flex-direction: column;
  }

  .expiry-input,
  .security-input,
  .name-input {
    width: 100% !important;
  }
}
</style>