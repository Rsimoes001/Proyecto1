const express = require('express');
const { collectDefaultMetrics, register, Counter, Histogram } = require('prom-client');

const app = express();
const PORT = 8080;

// ==========================================================
// 1. INSTRUMENTACIÓN DE MÉTRICAS (PROMETHEUS)
// ==========================================================

// Habilitar la recolección de métricas por defecto (CPU, memoria, etc.)
collectDefaultMetrics({ prefix: 'node_app_' });

// Crear un contador personalizado para las predicciones
const predictionCounter = new Counter({
  name: 'app_predictions_total',
  help: 'Número total de solicitudes al endpoint de predicción',
  labelNames: ['status'] // Podemos etiquetar si la predicción fue exitosa o fallida
});

// Crear un histograma para medir la latencia del endpoint /predict
const predictionLatency = new Histogram({
  name: 'app_prediction_latency_seconds',
  help: 'Latencia del endpoint de predicción en segundos',
  labelNames: ['endpoint'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

// ==========================================================
// 2. ENDPOINTS DE LA APLICACIÓN
// ==========================================================

// Endpoint Raíz
app.get('/', (req, res) => {
  console.log('Solicitud recibida en el endpoint raíz.');
  res.status(200).send('<h1>🚀 Proyecto CI/CD: Aplicación de IA Desplegada.</h1>');
});

// Endpoint de Predicción (Simulado)
app.get('/predict', async (req, res) => {
  const end = predictionLatency.startTimer();
  console.log('Iniciando simulación de predicción...');

  // Simular un procesamiento de IA que tarda entre 500ms y 2000ms
  const delay = Math.random() * 1500 + 500;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Resultado simulado
  const result = {
    prediction: 'Clasificación Exitosa',
    confidence: (Math.random() * 0.4 + 0.6).toFixed(2), // Confianza entre 60% y 100%
    model: 'gemini-2.5-flash-preview-05-20'
  };

  // Incrementar contador de predicciones exitosas
  predictionCounter.inc({ status: 'success' });

  // Registrar la latencia
  end({ endpoint: '/predict' });

  res.status(200).json(result);
});

// Endpoint de Métricas para Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// ==========================================================
// 3. INICIO DEL SERVIDOR
// ==========================================================

// Para que Mocha pueda importar la app sin iniciar el servidor
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor de IA escuchando en el puerto ${PORT}`);
    console.log(`Métricas disponibles en http://localhost:${PORT}/metrics`);
  });
}

// Exportar la app para los tests
module.exports = app;
