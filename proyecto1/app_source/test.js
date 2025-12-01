// test.js
const request = require('supertest');
const app = require('./app');
const chai = require('chai');
const expect = chai.expect;

// Describe el conjunto de pruebas para la aplicación
describe('API Endpoints', () => {

  // Prueba para el endpoint raíz
  it('GET / debe responder con un mensaje de saludo (status 200)', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.include('Proyecto CI/CD: Aplicación de IA Desplegada');
        done();
      });
  });

  // Prueba para el endpoint /predict
  it('GET /predict debe devolver una predicción simulada con campos válidos (status 200)', (done) => {
    request(app)
      .get('/predict')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Asegura que la respuesta es JSON
        expect(res.body).to.be.an('object');

        // Asegura que contiene los campos de resultado esperados
        expect(res.body).to.have.property('prediction').that.is.a('string');
        expect(res.body).to.have.property('confidence').that.is.a('string');
        expect(res.body).to.have.property('model').that.is.equal('gemini-2.5-flash-preview-05-20');

        done();
      });
  }).timeout(3000); // Aumentar timeout por el delay simulado

  // Prueba para el endpoint de métricas
  it('GET /metrics debe devolver métricas en formato Prometheus (Content-Type text/plain)', (done) => {
    request(app)
      .get('/metrics')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Asegura el tipo de contenido correcto para Prometheus
        expect(res.header['content-type']).to.include('text/plain');

        // Asegura que la respuesta contiene métricas personalizadas
        expect(res.text).to.include('app_predictions_total');
        expect(res.text).to.include('app_prediction_latency_seconds');
                
        done();
      });
  });
});
