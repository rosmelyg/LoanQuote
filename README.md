# LoanQuote - Generador de Cotizaciones de Préstamos

📄 **Descripción**


LoanQuote es una aplicación web dinámica diseñada para registrar los datos de una entidad financiera, información del solicitante y las condiciones de un préstamo para calcular automáticamente las cuotas, los intereses y generar un plan de pago detallado. El sistema evalúa el perfil financiero y genera una vista visual de la cotización final lista para revisión.

✨ **Características Principales**

Cálculos Financieros Automáticos, Soporte para cálculos basados en cuota fija y capital fijo, Opción de agregar pagos extraordinarios dinámicamente que reducen directamente el balance pendiente, Cálculo automático de la relación cuota/ingreso para determinar el nivel de endeudamiento del solicitante y la Generación de Reporte mediante la creación de una tabla de amortización completa y una cotización visual que resume toda la transacción.

## 🛠️ Stack Tecnológico y Arquitectura
Este proyecto fue desarrollado bajo estrictos requerimientos técnicos centrados en el desarrollo puro del lado del cliente:
- **Lenguajes:** HTML5, CSS3, JavaScript.
- **Librerías:** jQuery (para manipulación del DOM y validaciones) y Bootstrap 5.
- **Restricciones de Arquitectura:** 
  - Ejecución 100% en el navegador a través del archivo `index.html`.
  - Sin dependencias externas.
  - Sin backend, sin bases de datos y sin uso de persistencia local.
  - Sin uso de frameworks reactivos (React, Angular, Vue, etc.) ni herramientas de compilación.